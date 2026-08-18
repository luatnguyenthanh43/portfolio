<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('experiences', function (Blueprint $table) {
            $table->string('location')->nullable()->after('description');
            $table->string('employment_type')->nullable()->after('location');
            $table->json('tech_stack')->nullable()->after('employment_type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('experiences', function (Blueprint $table) {
            $table->dropColumn(['location', 'employment_type', 'tech_stack']);
        });
    }
};
