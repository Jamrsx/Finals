<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Tracks;
use App\Models\trackEnrollment;
use App\Models\StudentAcc;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class Student_enrollment extends Controller
{
    // Get all enrollments
    public function getAllEnrollments()
    {
        try {
            $enrollments = trackEnrollment::with(['student.section', 'track'])
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json([
                'status' => 'success',
                'data' => $enrollments
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching enrollments: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch enrollments: ' . $e->getMessage()
            ], 500);
        }
    }

    // Get all available tracks
    public function getAvailableTracks()
    {
        $tracks = Tracks::all();
        return response()->json([
            'status' => 'success',
            'data' => $tracks
        ]);
    }

    // Enroll in a track
    public function enrollInTrack(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'student_id' => 'required|exists:student_acc,student_id',
            'track_id' => 'required|exists:track,track_id'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => $validator->errors()
            ], 422);
        }

        // Check if student already has a pending or active enrollment
        $existingEnrollment = trackEnrollment::where('student_id', $request->student_id)
            ->whereIn('status', ['pending', 'active'])
            ->first();

        if ($existingEnrollment) {
            return response()->json([
                'status' => 'error',
                'message' => 'You already have a pending or active enrollment'
            ], 400);
        }

        // Get track details
        $track = Tracks::find($request->track_id);

        // Create new enrollment
        $enrollment = trackEnrollment::create([
            'student_id' => $request->student_id,
            'track_id' => $request->track_id,
            'track_name' => $track->track_name,
            'status' => 'pending'
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Track enrollment request submitted successfully',
            'data' => $enrollment
        ]);
    }

    // Get student's enrollment status
    public function getEnrollmentStatus($studentId)
    {
        $enrollment = trackEnrollment::where('student_id', $studentId)
            ->with(['track', 'student'])
            ->latest()
            ->first();

        if (!$enrollment) {
            return response()->json([
                'status' => 'error',
                'message' => 'No enrollment found'
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'data' => $enrollment
        ]);
    }

    // Update enrollment status (accept/decline)
    public function updateEnrollmentStatus($id, $action)
    {
        $enrollment = trackEnrollment::find($id);
        
        if (!$enrollment) {
            return response()->json([
                'status' => 'error',
                'message' => 'Enrollment not found'
            ], 404);
        }

        if ($enrollment->status !== 'pending') {
            return response()->json([
                'status' => 'error',
                'message' => 'This enrollment request has already been processed'
            ], 400);
        }

        if (!in_array($action, ['accept', 'decline'])) {
            return response()->json([
                'status' => 'error',
                'message' => 'Invalid action. Must be either accept or decline'
            ], 400);
        }

        $enrollment->status = $action === 'accept' ? 'accepted' : 'declined';
        $enrollment->save();

        return response()->json([
            'status' => 'success',
            'message' => 'Enrollment request ' . $action . 'ed successfully',
            'data' => $enrollment
        ]);
    }

    // Cancel enrollment request
    public function cancelEnrollment(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'id' => 'required|integer',
                'student_id' => 'required|string'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Please provide valid enrollment ID and student ID'
                ], 422);
            }

            // Find the enrollment
            $enrollment = trackEnrollment::where('id', $request->id)
                ->where('student_id', $request->student_id)
                ->first();

            if (!$enrollment) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Enrollment not found or you are not authorized to cancel this enrollment'
                ], 404);
            }

            if ($enrollment->status !== 'pending') {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Only pending enrollments can be cancelled'
                ], 400);
            }

            $enrollment->status = 'cancelled';
            $enrollment->save();

            return response()->json([
                'status' => 'success',
                'message' => 'Enrollment request cancelled successfully',
                'data' => $enrollment
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'An error occurred while cancelling the enrollment'
            ], 500);
        }
    }
}
