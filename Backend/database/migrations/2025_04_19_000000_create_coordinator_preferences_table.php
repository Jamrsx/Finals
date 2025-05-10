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
        Schema::create('coordinator_preferences', function (Blueprint $table) {
            $table->id();
            $table->string('coordinator_id');
            $table->boolean('show_accepted_enrollments')->default(false);
            $table->boolean('show_rejected_enrollments')->default(false);
            $table->timestamps();

            $table->foreign('coordinator_id')
                ->references('coordinator_id')
                ->on('coordinator')
                ->onDelete('cascade')
                ->onUpdate('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('coordinator_preferences');
    }
}; 