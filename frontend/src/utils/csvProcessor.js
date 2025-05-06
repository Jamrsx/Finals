export const processCSV = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    const students = [];
    const errors = [];

    reader.onload = (e) => {
      try {
        const text = e.target.result;
        // Use more efficient string splitting
        const lines = text.split(/\r?\n/).filter(Boolean);
        
        if (lines.length < 2) {
          reject(new Error('CSV file must contain at least a header row and one data row'));
          return;
        }

        // Pre-process headers once
        const headerMap = {};
        const headers = lines[0].split(',');
        headers.forEach((h, i) => headerMap[h.trim().toLowerCase()] = i);

        // Check for phone header once
        const phoneHeaderKey = headerMap['phone_number'] !== undefined ? 'phone_number' : 
                             headerMap['phone_nu'] !== undefined ? 'phone_nu' : null;

        const requiredFields = ['student_id', 'lname', 'fname', 'email', phoneHeaderKey, 'gender', 'course', 'yearlevel', 'section'];
        
        // Validate headers
        const missingHeaders = requiredFields.filter(h => headerMap[h] === undefined);
        if (missingHeaders.length > 0 || !phoneHeaderKey) {
          reject(new Error(`Missing required columns: ${['student_id', 'lname', 'fname', 'email', 'phone_number or phone_nu', 'gender', 'course', 'yearlevel', 'section'].filter((h, i) => headerMap[h] === undefined).join(', ')}`));
          return;
        }

        // Process rows in chunks for better performance
        const CHUNK_SIZE = 1000;
        for (let i = 1; i < lines.length; i += CHUNK_SIZE) {
          const chunk = lines.slice(i, i + CHUNK_SIZE);
          
          chunk.forEach((line, index) => {
            const values = line.split(',');
            const rowNum = i + index + 1;

            if (values.length < headers.length) {
              errors.push(`Row ${rowNum}: Missing values. Expected ${headers.length} columns, got ${values.length}`);
              return;
            }

            // More efficient value lookup using pre-computed indices
            const getValue = (field) => {
              const idx = headerMap[field];
              return idx !== undefined ? values[idx].trim() : '';
            };

            let phoneValue = getValue(phoneHeaderKey);
            if (/e\+?\d+/i.test(phoneValue)) {
              try {
                phoneValue = String(parseInt(Number(phoneValue)));
              } catch {
                // leave as is if conversion fails
              }
            }

            const student = {
              student_id: getValue('student_id'),
              lname: getValue('lname'),
              fname: getValue('fname'),
              mname: getValue('mname') || '',
              suffix: getValue('suffix') || '',
              email: getValue('email'),
              Phone_number: phoneValue,
              gender: getValue('gender'),
              Course: getValue('course'),
              yearlevel: getValue('yearlevel'),
              section: getValue('section'),
              Track: getValue('track') || '',
              selected: false // Add selected property for bulk operations
            };

            const validationError = validateStudent(student, rowNum);
            if (validationError) {
              errors.push(validationError);
            } else {
              students.push(student);
            }
          });
        }

        resolve({ students, errors });
      } catch (error) {
        reject(new Error('Error processing CSV file: ' + error.message));
      }
    };

    // Use readAsArrayBuffer for potentially faster reading of large files
    reader.onerror = () => reject(new Error('Error reading file'));
    reader.readAsText(file);
  });
};

// Function to toggle selection of all students
export const toggleSelectAll = (students, selected) => {
  return students.map(student => ({
    ...student,
    selected: selected
  }));
};

// Function to get selected students
export const getSelectedStudents = (students) => {
  return students.filter(student => student.selected);
};

// Memoize validation functions for better performance
const memoize = (fn) => {
  const cache = new Map();
  return (...args) => {
    const key = JSON.stringify(args);
    if (!cache.has(key)) {
      cache.set(key, fn(...args));
    }
    return cache.get(key);
  };
};

const validateStudent = (student, rowNumber) => {
  const requiredFields = {
    student_id: 'Student ID',
    lname: 'Last Name',
    fname: 'First Name',
    email: 'Email',
    Phone_number: 'Phone Number',
    gender: 'Gender',
    Course: 'Course',
    yearlevel: 'Year Level',
    section: 'Section'
  };

  // Check required fields first
  for (const [field, label] of Object.entries(requiredFields)) {
    if (!student[field]?.trim()) {
      return `Row ${rowNumber}: ${label} is required`;
    }
  }

  // Only validate if required fields are present
  if (!isValidEmail(student.email)) {
    return `Row ${rowNumber}: Invalid email format`;
  }

  if (!isValidPhoneNumber(student.Phone_number)) {
    return `Row ${rowNumber}: Invalid phone number format`;
  }

  if (!isValidYearLevel(student.yearlevel)) {
    return `Row ${rowNumber}: Invalid year level`;
  }

  return null;
};

const isSpecialEmpty = memoize((val) => {
  if (!val) return true;
  const v = val.trim().toLowerCase();
  return v === '' || v === 'none' || v === 'null' || v === 'blank' || v === 'nan' || v === 'none';
});

const isValidEmail = memoize((email) => {
  if (isSpecialEmpty(email)) return true;
  const trimmed = email.trim();
  return trimmed.length > 0 && trimmed.includes('@');
});

const isValidPhoneNumber = memoize((phone) => {
  if (isSpecialEmpty(phone)) return true;
  const digits = phone.replace(/[^0-9]/g, '');
  return digits.length >= 7;
});

const isValidYearLevel = memoize((year) => {
  if (!year) return false;
  const validLevels = new Set(['first year', 'second year', 'third year', 'fourth year']);
  return validLevels.has(year.trim().toLowerCase());
});