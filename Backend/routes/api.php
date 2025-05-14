<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AddCoordinator;
use App\Http\Controllers\StudentController;
use App\Http\Controllers\Student_enrollment;
use App\Http\Controllers\CsvImportController;
use App\Http\Controllers\CoordinatorController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::post('/coordinatorAdd', [AddCoordinator::class, 'storeCoordinator']);
Route::post('/coordinator/login', [CoordinatorController::class, 'loginCoordinator']);

Route::post('/students', [CoordinatorController::class, 'storeStudent']);
Route::put('/student/{id}', [CoordinatorController::class, 'updateStudent']);
Route::delete('/student/{id}', [CoordinatorController::class, 'archiveStudent']);
Route::get('/showStudents', [CoordinatorController::class, 'getAllStudents']);
Route::delete('/students/archive-all', [CoordinatorController::class, 'archiveAllStudents']);
Route::get('/restore-student/{id}', [CoordinatorController::class, 'restoreStudent']);
Route::get('/restore-all-students', [CoordinatorController::class, 'restoreAllStudents']);

// CSV Import Routes
Route::post('/import-csv', [CsvImportController::class, 'import']);

Route::post('/tracks', [CoordinatorController::class, 'addTrack']);
Route::get('/ShowTracks', [CoordinatorController::class, 'showTracks']);
Route::put('/UpdateTrack/{id}', [CoordinatorController::class, 'updateTrack']);
Route::delete('/DeleteTrack/{id}', [CoordinatorController::class, 'deleteTrack']);

Route::post('/instructors', [CoordinatorController::class, 'addInstructor']);
Route::get('/ShowInstructor', [CoordinatorController::class, 'showInstructors']);
Route::get('/ShowInstructor/{id}', [CoordinatorController::class, 'showInstructorById']);
Route::put('/UpdateInstructor/{id}', [CoordinatorController::class, 'updateInstructor']);
Route::delete('/DeleteInstructor/{id}', [CoordinatorController::class, 'deleteInstructor']);

Route::get('/students', [CoordinatorController::class, 'showStudents']);

// Student Track Enrollment Routes
Route::get('/enrollments', [Student_enrollment::class, 'getAllEnrollments']);
Route::get('/available-tracks', [Student_enrollment::class, 'getAvailableTracks']);
Route::post('/enroll-track', [Student_enrollment::class, 'enrollInTrack']);
Route::get('/enrollment-status/{student_id}', [Student_enrollment::class, 'getEnrollmentStatus']);
Route::put('/enrollments/{id}/{action}', [Student_enrollment::class, 'updateEnrollmentStatus']);
Route::post('/cancel-enrollment', [Student_enrollment::class, 'cancelEnrollment']);

// Coordinator Preferences Routes
Route::get('/coordinator/{coordinatorId}/preferences', [CoordinatorController::class, 'getPreferences']);
Route::put('/coordinator/{coordinatorId}/preferences', [CoordinatorController::class, 'updatePreferences']);


// Student Or Mobile app routes
Route::post('/login', [StudentController::class, 'login']);
