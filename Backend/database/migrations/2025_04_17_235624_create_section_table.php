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
        Schema::create('section', function (Blueprint $table) {
            $table->id();
            $table->string('student_id')->index();
            $table->string('Course');
            $table->string('yearlevel');
            $table->string('section');
            $table->string('instructor');
            $table->string('Track');
            $table->timestamps();

            $table->foreign('student_id')
                ->references('student_id')
                ->on('student_details')
                ->onDelete('cascade')->onUpdate('cascade');


            $table->foreign('instructor')
                ->references('instructor_id')
                ->on('instructor')
                ->onDelete('cascade')->onUpdate('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('section_details');
    }
};
