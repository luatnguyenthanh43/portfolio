<?php

namespace Tests\Unit;

use App\Support\HtmlSanitizer;
use Tests\TestCase;

class HtmlSanitizerTest extends TestCase
{
    public function test_null_returns_null(): void
    {
        $this->assertNull(HtmlSanitizer::purify(null));
    }

    public function test_empty_string_returns_empty_string(): void
    {
        $this->assertSame('', HtmlSanitizer::purify(''));
    }

    public function test_strips_script_tags_and_content(): void
    {
        $this->assertSame('<p>a</p>', HtmlSanitizer::purify('<p>a</p><script>alert(1)</script>'));
    }

    public function test_strips_event_handlers(): void
    {
        $this->assertSame('<p>a</p>', HtmlSanitizer::purify('<p onclick="x()" onmouseover="y()">a</p>'));
    }

    public function test_strips_iframe(): void
    {
        $this->assertSame('<p>a</p>', HtmlSanitizer::purify('<p>a</p><iframe src="https://e.com"></iframe>'));
    }

    public function test_strips_style_attribute_and_style_tag(): void
    {
        $out = HtmlSanitizer::purify('<p style="color:red">a</p><style>p{color:red}</style>');

        $this->assertStringNotContainsString('style', $out);
        $this->assertStringContainsString('<p>a</p>', $out);
    }

    public function test_strips_javascript_urls(): void
    {
        $out = HtmlSanitizer::purify('<a href="javascript:alert(1)">x</a>');

        $this->assertStringNotContainsString('javascript', $out);
    }

    public function test_strips_disallowed_tags_but_keeps_text(): void
    {
        $out = HtmlSanitizer::purify('<div><img src="https://e.com/a.png"><h1>T</h1><span>s</span></div>');

        $this->assertStringNotContainsString('<div', $out);
        $this->assertStringNotContainsString('<img', $out);
        $this->assertStringNotContainsString('<h1', $out);
        $this->assertStringNotContainsString('<span', $out);
        $this->assertStringContainsString('T', $out);
        $this->assertStringContainsString('s', $out);
    }

    public function test_keeps_allowed_tags(): void
    {
        $html = '<p>a<br />b</p><strong>s</strong><em>e</em><u>u</u><s>x</s><ul><li>i</li></ul><ol><li>j</li></ol>'
            . '<h2>h2</h2><h3>h3</h3><blockquote>q</blockquote>';

        $this->assertSame($html, HtmlSanitizer::purify($html));
    }

    public function test_links_get_target_blank_and_noopener(): void
    {
        $out = HtmlSanitizer::purify('<a href="https://example.com" title="t">x</a>');

        $this->assertStringContainsString('href="https://example.com"', $out);
        $this->assertStringContainsString('title="t"', $out);
        $this->assertStringContainsString('target="_blank"', $out);
        $this->assertStringContainsString('rel="noreferrer noopener"', $out);
    }

    public function test_disallowed_link_target_is_dropped_then_forced_to_blank(): void
    {
        $out = HtmlSanitizer::purify('<a href="https://example.com" target="_top">x</a>');

        $this->assertStringContainsString('target="_blank"', $out);
        $this->assertStringNotContainsString('_top', $out);
    }

    public function test_empty_tags_are_removed(): void
    {
        $this->assertSame('<p>a</p>', HtmlSanitizer::purify('<p>a</p><p></p><strong></strong><em> </em>'));
    }

    public function test_cache_directory_is_created(): void
    {
        $dir = storage_path('app/htmlpurifier');
        if (is_dir($dir)) {
            foreach (glob($dir . '/*/*') ?: [] as $f) {
                is_file($f) && @unlink($f);
            }
            foreach (glob($dir . '/*') ?: [] as $d) {
                is_dir($d) && @rmdir($d);
            }
            @rmdir($dir);
        }
        $this->assertDirectoryDoesNotExist($dir);

        HtmlSanitizer::purify('<p>x</p>');

        $this->assertDirectoryExists($dir);
    }
}
