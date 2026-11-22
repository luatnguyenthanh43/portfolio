<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('projects', function (Blueprint $table) {
            $table->string('company')->nullable()->after('title');
            $table->string('role')->nullable()->after('company');
            $table->string('summary', 300)->nullable()->after('role');
        });
    }

    public function down(): void
    {
        Schema::table('projects', function (Blueprint $table) {
            $table->dropColumn(['company', 'role', 'summary']);
        });
    }
};
