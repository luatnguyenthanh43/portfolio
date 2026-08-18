<?php

namespace App\Support;

use HTMLPurifier;
use HTMLPurifier_Config;

class HtmlSanitizer
{
    private const ALLOWED = 'p,br,strong,em,u,s,ul,ol,li,a[href|title|target|rel],h2,h3,blockquote';

    public static function purify(?string $html): ?string
    {
        if ($html === null) {
            return null;
        }

        $cachePath = storage_path('app/htmlpurifier');

        if (! is_dir($cachePath)) {
            mkdir($cachePath, 0755, true);
        }

        $config = HTMLPurifier_Config::createDefault();
        $config->set('HTML.Allowed', self::ALLOWED);
        $config->set('AutoFormat.RemoveEmpty', true);
        $config->set('Attr.AllowedFrameTargets', ['_blank']);
        $config->set('HTML.TargetBlank', true);
        $config->set('Cache.SerializerPath', $cachePath);

        return (new HTMLPurifier($config))->purify($html);
    }
}
