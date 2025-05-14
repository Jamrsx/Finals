<?php

namespace App\Http\Controllers;

use App\Models\Tracks;
use App\Models\instructor;
use App\Models\StudentAcc;
use App\Models\Coordinator;
use Illuminate\Http\Request;
use App\Models\StudentDetails;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use App\Models\Section;
use App\Models\CoordinatorPreference;
use Illuminate\Support\Facades\Validator;

class CoordinatorController extends Controller
{
    //==============================ADD STUDENT DETAILS AND ACCOUNT===============================
    public function storeStudent(Request $request)
    {
        try {
            // Log the incoming request data
            Log::info('Incoming student data:', $request->all());

            // Validate input
            $validatedData = $request->validate([
                'student_id' => 'required|unique:student_acc,student_id',
                'lname' => 'required|string',
                'fname' => 'required|string',
                'mname' => 'nullable|string',
                'suffix' => 'nullable|string',
                'email' => 'required|email|unique:student_details,email',
                'Phone_number' => 'required|string',
                'gender' => 'required|string',
                'Course' => 'required|string',
                'yearlevel' => 'required|string',
                'section' => 'required|string',
                'Track' => 'nullable|string'
            ]);

            Log::info('Validated data:', $validatedData);

            DB::beginTransaction();

            try {
                // Create student account with default password
                $studentAcc = StudentAcc::create([
                    'student_id' => $validatedData['student_id'],
                    'password' => Hash::make('123456'), // Default password
                    'status' => '1',
                ]);

                // Create student details
                $studentDetails = StudentDetails::create([
                    'student_id' => $validatedData['student_id'],
                    'lname' => $validatedData['lname'],
                    'fname' => $validatedData['fname'],
                    'mname' => $validatedData['mname'],
                    'suffix' => $validatedData['suffix'],
                    'email' => $validatedData['email'],
                    'Phone_number' => $validatedData['Phone_number'],
                    'gender' => $validatedData['gender'],
                    'status' => '1',
                ]);

                // Create section
                $section = Section::create([
                    'student_id' => $validatedData['student_id'],
                    'Course' => $validatedData['Course'],
                    'yearlevel' => $validatedData['yearlevel'],
                    'section' => $validatedData['section'],
                    'instructor' => null,
                    'Track' => $validatedData['Track'] ?? null,
                ]);

                DB::commit();

                return response()->json([
                    'message' => 'Student successfully added with default password: 123456',
                    'data' => [
                        'student_acc' => $studentAcc,
                        'student_details' => $studentDetails,
                        'section' => $section
                    ]
                ], 201);
            } catch (\Exception $e) {
                DB::rollBack();
                Log::error('Error creating student records: ' . $e->getMessage());
                return response()->json([
                    'error' => 'Failed to save student records',
                    'details' => $e->getMessage()
                ], 500);
            }
        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('Validation error: ' . json_encode($e->errors()));
            return response()->json([
                'error' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Unexpected error: ' . $e->getMessage());
            return response()->json([
                'error' => 'An unexpected error occurred',
                'details' => $e->getMessage()
            ], 500);
        }
    }

    public function getAllStudents(Request $request)
    {
        try {
            $perPage = $request->input('per_page', 10);
            $page = $request->input('page', 1);
            $search = $request->input('search', '');
            $showArchived = $request->input('show_archived', false);

            // Build the query
            $query = StudentDetails::with(['account', 'section', 'acceptedTrackEnrollment'])
                ->orderBy('created_at', 'desc');

            // Add search conditions if search term is provided
            if (!empty($search)) {
                $query->where(function($q) use ($search) {
                    $q->where('lname', 'like', '%' . $search . '%')
                      ->orWhere('student_id', 'like', '%' . $search . '%')
                      ->orWhere('fname', 'like', '%' . $search . '%')
                      ->orWhere('email', 'like', '%' . $search . '%');
                });
            }

            // Filter by archived status
            if ($showArchived) {
                $query->where('status', '0'); // Show only archived students
            } else {
                $query->where('status', '1'); // Show only active students
            }

            // Get paginated students
            $students = $query->paginate($perPage, ['*'], 'page', $page);

            // Format the student data
            $formattedStudents = $students->map(function ($student) {
                return [
                    'student_id' => $student->student_id,
                    'lname' => $student->lname,
                    'fname' => $student->fname,
                    'mname' => $student->mname,
                    'suffix' => $student->suffix,
                    'email' => $student->email,
                    'Phone_number' => $student->Phone_number,
                    'gender' => $student->gender,
                    'status' => $student->status,
                    'section' => $student->section ? [
                        'Course' => $student->section->Course,
                        'yearlevel' => $student->section->yearlevel,
                        'section' => $student->section->section,
                        'instructor' => $student->section->instructor,
                        'Track' => $student->section->Track,
                    ] : null,
                    'account' => $student->account ? [
                        'status' => $student->account->status,
                    ] : null,
                    'accepted_track' => $student->acceptedTrackEnrollment ? $student->acceptedTrackEnrollment->track_name : null,
                ];
            });

            return response()->json([
                'students' => $formattedStudents,
                'pagination' => [
                    'total' => $students->total(),
                    'per_page' => $students->perPage(),
                    'current_page' => $students->currentPage(),
                    'last_page' => $students->lastPage(),
                    'from' => $students->firstItem(),
                    'to' => $students->lastItem()
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching students: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to fetch students: ' . $e->getMessage()], 500);
        }
    }

    public function updateStudent(Request $request, $id)
    {
        try {
            // Log the incoming request data
            Log::info('Incoming update data:', $request->all());

            // Validate input
            $validatedData = $request->validate([
                'lname' => 'required|string',
                'fname' => 'required|string',
                'mname' => 'nullable|string',
                'suffix' => 'nullable|string',
                'email' => 'required|email|unique:student_details,email,' . $id . ',student_id',
                'Phone_number' => 'required|string',
                'gender' => 'required|string',
                'Course' => 'required|string',
                'yearlevel' => 'required|string',
                'section' => 'required|string',
                'Track' => 'nullable|string'
            ]);

            Log::info('Validated update data:', $validatedData);

            DB::beginTransaction();

            try {
                // Update student details
                $studentDetails = StudentDetails::where('student_id', $id)->first();
                if (!$studentDetails) {
                    return response()->json(['error' => 'Student not found'], 404);
                }

                $studentDetails->update([
                    'lname' => $validatedData['lname'],
                    'fname' => $validatedData['fname'],
                    'mname' => $validatedData['mname'],
                    'suffix' => $validatedData['suffix'],
                    'email' => $validatedData['email'],
                    'Phone_number' => $validatedData['Phone_number'],
                    'gender' => $validatedData['gender']
                ]);

                // Update section
                $section = Section::where('student_id', $id)->first();
                if ($section) {
                    $section->update([
                        'Course' => $validatedData['Course'],
                        'yearlevel' => $validatedData['yearlevel'],
                        'section' => $validatedData['section'],
                        'Track' => $validatedData['Track'] ?? null
                    ]);
                }

                DB::commit();

                return response()->json([
                    'message' => 'Student successfully updated',
                    'data' => [
                        'student_details' => $studentDetails,
                        'section' => $section
                    ]
                ], 200);
            } catch (\Exception $e) {
                DB::rollBack();
                Log::error('Error updating student records: ' . $e->getMessage());
                return response()->json([
                    'error' => 'Failed to update student records',
                    'details' => $e->getMessage()
                ], 500);
            }
        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('Validation error: ' . json_encode($e->errors()));
            return response()->json([
                'error' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Unexpected error: ' . $e->getMessage());
            return response()->json([
                'error' => 'An unexpected error occurred',
                'details' => $e->getMessage()
            ], 500);
        }
    }

    public function archiveStudent($id)
    {
        DB::beginTransaction();

        try {
            $studentAcc = StudentAcc::where('student_id', $id)->first();
            $studentDetails = StudentDetails::where('student_id', $id)->first();

            if (!$studentAcc || !$studentDetails) {
                return response()->json(['error' => 'Student not found'], 404);
            }

            // Update status to archived (0) instead of deleting
            $studentAcc->update(['status' => '0']);
            $studentDetails->update(['status' => '0']);

            DB::commit();
            return response()->json(['message' => 'Student successfully archived.'], 200);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'Failed to archive student. ' . $e->getMessage()], 500);
        }
    }
    public function archiveAllStudents()
    {
        DB::beginTransaction();

        try {
            // Get count before archiving
            $count = StudentAcc::where('status', '1')->count();

            if ($count === 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'No active students found to archive'
                ], 404);
            }

            // Archive all active records
            $updatedAcc = StudentAcc::where('status', '1')->update(['status' => '0']);
            $updatedDetails = StudentDetails::where('status', '1')->update(['status' => '0']);

            if ($updatedAcc === 0 || $updatedDetails === 0) {
                throw new \Exception('Failed to update student records');
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'All students archived successfully',
                'count' => $count
            ], 200);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error in deleteAllStudents: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to archive all students: ' . $e->getMessage()
            ], 500);
        }
    }

    public function restoreAllStudents()
    {
        DB::beginTransaction();

        try {
            // Get count before restoring
            $count = StudentAcc::where('status', '0')->count();

            if ($count === 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'No archived students found to restore'
                ], 404);
            }

            // Restore all archived records
            $updatedAcc = StudentAcc::where('status', '0')->update(['status' => '1']);
            $updatedDetails = StudentDetails::where('status', '0')->update(['status' => '1']);

            if ($updatedAcc === 0 || $updatedDetails === 0) {
                throw new \Exception('Failed to update student records');
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'All students restored successfully',
                'count' => $count
            ], 200);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error in restoreAllStudents: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to restore all students: ' . $e->getMessage()
            ], 500);
        }
    }

    

    //==============================END ADD STUDENT DETAILS AND ACCOUNT===============================

    //==============================ADD TRACK===============================

    public function addTrack(Request $request)
    {
        $validatedData = $request->validate([
            'track_id' => 'required|unique:track,track_id',  // Ensure track_id is unique
            'track_name' => 'required|string|max:255',
            'description' => 'required|string|max:65535',
        ]);

        DB::beginTransaction();

        try {
            // Proceed to create the track with the provided track_id
            $track = Tracks::create([
                'track_id' => $validatedData['track_id'],
                'track_name' => $validatedData['track_name'],
                'description' => $validatedData['description'],
            ]);

            DB::commit();

            return response()->json(['message' => 'Track successfully added.'], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'Failed to save Track. ' . $e->getMessage()], 500);
        }
    }


    //Show Track
    public function showTracks()
    {
        try {
            $tracks = Tracks::all(); // fetch all tracks
            return response()->json($tracks, 200);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to fetch tracks. ' . $e->getMessage()], 500);
        }
    }

    //Update Track
    public function updateTrack(Request $request, $id)
    {
        $validatedData = $request->validate([
            'track_name' => 'sometimes|string',
            'description' => 'sometimes|string',
        ]);

        try {
            $track = Tracks::where('track_id', $id)->first();

            if (!$track) {
                return response()->json(['message' => 'Track not found'], 404);
            }

            $track->update($validatedData);

            return response()->json([
                'message' => 'Track updated successfully.',
                'data' => $track
            ], 200);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to update track. ' . $e->getMessage()], 500);
        }
    }
    //Delete Track
    public function deleteTrack($id)
    {
        try {
            $track = Tracks::where('track_id', $id)->first();

            if (!$track) {
                return response()->json(['message' => 'Track not found'], 404);
            }

            $track->delete();

            return response()->json(['message' => 'Track deleted successfully.'], 200);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to delete track. ' . $e->getMessage()], 500);
        }
    }


    //==============================END ADD TRACK================================

    //==============================ADD INSTRUCTOR===============================
    public function addInstructor(Request $request)
    {
        $validatedData = $request->validate([
            'instructor_id' => 'required|string',
            'lname' => 'required|string',
            'fname' => 'required|string',
            'email' => 'required|string',
            'phone' => 'required|string',
        ]);

        DB::beginTransaction();

        try {
            $track = instructor::create([
                'instructor_id' => $validatedData['instructor_id'],
                'lname' => $validatedData['lname'],
                'fname' => $validatedData['fname'],
                'email' => $validatedData['email'],
                'phone' => $validatedData['phone'],
            ]);


            DB::commit();

            return response()->json(['message' => 'Instructor successfully added.'], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'Failed to save Instructor. ' . $e->getMessage()], 500);
        }
    }
    public function showInstructorById($id)
    {
        try {
            $instructor = Instructor::where('instructor_id', $id)->first();

            if (!$instructor) {
                return response()->json(['message' => 'Instructor not found'], 404);
            }

            return response()->json($instructor, 200);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to fetch instructor. ' . $e->getMessage()], 500);
        }
    }

    public function showInstructors()
    {
        try {
            $instructors = Instructor::all();
            return response()->json($instructors, 200);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to fetch instructors. ' . $e->getMessage()], 500);
        }
    }
    public function updateInstructor(Request $request, $id)
    {
        try {
            // Validate input
            $validatedData = $request->validate([
                'instructor_id' => 'sometimes|string',
                'lname' => 'required|string',
                'fname' => 'required|string', 
                'email' => 'required|email',
                'phone' => 'required|string'
            ]);

            // Start transaction
            DB::beginTransaction();

            try {
                $instructor = Instructor::where('instructor_id', $id)->first();

                if (!$instructor) {
                    return response()->json(['error' => 'Instructor not found'], 404);
                }

                // Update instructor details
                $instructor->update([
                    'lname' => $validatedData['lname'],
                    'fname' => $validatedData['fname'],
                    'email' => $validatedData['email'],
                    'phone' => $validatedData['phone']
                ]);

                DB::commit();

                return response()->json([
                    'message' => 'Instructor successfully updated',
                    'data' => $instructor
                ], 200);

            } catch (\Exception $e) {
                DB::rollBack();
                return response()->json([
                    'error' => 'Failed to update instructor records',
                    'details' => $e->getMessage()
                ], 500);
            }

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'error' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'An unexpected error occurred',
                'details' => $e->getMessage()
            ], 500);
        }
    }

    public function deleteInstructor($id)
    {
        try {
            $instructor = Instructor::where('instructor_id', $id)->first();

            if (!$instructor) {
                return response()->json(['message' => 'Instructor not found'], 404);
            }

            $instructor->delete();

            return response()->json(['message' => 'Instructor deleted successfully.'], 200);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to delete instructor. ' . $e->getMessage()], 500);
        }
    }


    //==============================END ADD INSTRUCTOR===============================

    public function loginCoordinator(Request $request)
    {
        $validatedData = $request->validate([
            'coordinator_id' => 'required',
            'password' => 'required|string',
        ]);

        try {

            $coordinator = Coordinator::where('coordinator_id', $validatedData['coordinator_id'])->first();

            if (!$coordinator) {
                return response()->json(['error' => 'Coordinator not found.'], 404);
            }

            if (!Hash::check($validatedData['password'], $coordinator->password)) {
                return response()->json(['error' => 'Invalid password.'], 401);
            }

            return response()->json([
                'message' => 'Login successful',
                'coordinator' => $coordinator,
            ], 200);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Login failed. ' . $e->getMessage()], 500);
        }
    }

    public function restoreStudent($id)
    {
        DB::beginTransaction();

        try {
            $studentAcc = StudentAcc::where('student_id', $id)->first();
            $studentDetails = StudentDetails::where('student_id', $id)->first();

            if (!$studentAcc || !$studentDetails) {
                return response()->json(['error' => 'Student not found'], 404);
            }

            // Update status to active
            $studentAcc->update(['status' => '1']);
            $studentDetails->update(['status' => '1']);

            DB::commit();
            return response()->json(['message' => 'Student successfully restored.'], 200);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'Failed to restore student. ' . $e->getMessage()], 500);
        }
    }

    public function getPreferences($coordinatorId)
    {
        try {
            $preferences = CoordinatorPreference::firstOrCreate(
                ['coordinator_id' => $coordinatorId],
                [
                    'show_accepted_enrollments' => false,
                    'show_rejected_enrollments' => false
                ]
            );

            return response()->json([
                'status' => 'success',
                'data' => $preferences
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch preferences: ' . $e->getMessage()
            ], 500);
        }
    }

    public function updatePreferences(Request $request, $coordinatorId)
    {
        try {
            $validator = Validator::make($request->all(), [
                'show_accepted_enrollments' => 'required|boolean',
                'show_rejected_enrollments' => 'required|boolean'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => 'error',
                    'message' => $validator->errors()
                ], 422);
            }

            $preferences = CoordinatorPreference::updateOrCreate(
                ['coordinator_id' => $coordinatorId],
                [
                    'show_accepted_enrollments' => $request->show_accepted_enrollments,
                    'show_rejected_enrollments' => $request->show_rejected_enrollments
                ]
            );

            return response()->json([
                'status' => 'success',
                'message' => 'Preferences updated successfully',
                'data' => $preferences
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to update preferences: ' . $e->getMessage()
            ], 500);
        }
    }
}
