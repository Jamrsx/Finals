export const processCSV = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    const students = [];
    const errors = [];

    reader.onload = (e) => {
      try {
        const text = e.target.result;
        const lines = text.split('\n').filter(line => line.trim()); // Remove empty lines
        if (lines.length < 2) {
          reject(new Error('CSV file must contain at least a header row and one data row'));
          return;
        } 

        // Lowercase and trim headers for flexible matching
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        // Accept both phone_nu and phone_number
        const phoneHeader = headers.includes('phone_number') ? 'phone_number' : (headers.includes('phone_nu') ? 'phone_nu' : null);
        const requiredHeaders = ['student_id', 'lname', 'fname', 'email', phoneHeader, 'gender', 'course', 'yearlevel', 'section'];
        // Validate headers
        const missingHeaders = requiredHeaders.filter(h => !h);
        if (missingHeaders.length > 0 || !phoneHeader) {
          reject(new Error(`Missing required columns: ${['student_id', 'lname', 'fname', 'email', 'phone_number or phone_nu', 'gender', 'course', 'yearlevel', 'section'].filter((h, i) => !requiredHeaders[i]).join(', ')}`));
          return;
        }

        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map(v => v.trim());
          if (values.length < headers.length) {
            errors.push(`Row ${i + 1}: Missing values. Expected ${headers.length} columns, got ${values.length}`);
            continue;
          }

          // Helper to get value by header name (case-insensitive)
          const getValue = (name) => {
            const idx = headers.indexOf(name);
            return idx !== -1 ? values[idx] : '';
          };

          // Convert phone number from scientific notation if needed
          let phoneValue = getValue('phone_number') || getValue('phone_nu');
          if (/e\+?\d+/i.test(phoneValue)) {
            // Convert scientific notation to plain string
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
            mname: getValue('mname'),
            suffix: getValue('suffix'),
            email: getValue('email'),
            Phone_number: phoneValue,
            gender: getValue('gender'),
            Course: getValue('course'),
            yearlevel: getValue('yearlevel'),
            section: getValue('section'),
            Track: getValue('track')
          };

          // Fill missing optional fields with empty string
          ['mname', 'suffix', 'Track'].forEach(f => { if (student[f] === undefined) student[f] = ''; });

          // Validate the student data
          const validationError = validateStudent(student, i + 1);
          if (validationError) {
            errors.push(validationError);
          } else {
            students.push(student);
          }
        }

        resolve({ students, errors });
      } catch (error) {
        reject(new Error('Error processing CSV file: ' + error.message));
      }
    };

    reader.onerror = () => reject(new Error('Error reading file'));
    reader.readAsText(file);
  });
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

  // Trim all values before validation
  Object.keys(student).forEach(key => {
    if (typeof student[key] === 'string') {
      student[key] = student[key].trim();
    }
  });

  // Check required fields
  for (const [field, label] of Object.entries(requiredFields)) {
    if (!student[field]) {
      return `Row ${rowNumber}: ${label} is required`;
    }
  }

  // Validate email format (trimmed, case-insensitive)
  if (!isValidEmail(student.email)) {
    return `Row ${rowNumber}: Invalid email format`;
  }

  // Validate phone number format (trimmed, only digits, 10+ digits)
  if (!isValidPhoneNumber(student.Phone_number)) {
    return `Row ${rowNumber}: Invalid phone number format`;
  }

  // Validate year level
  if (!isValidYearLevel(student.yearlevel)) {
    return `Row ${rowNumber}: Invalid year level`;
  }

  return null;
};

const isSpecialEmpty = (val) => {
  if (!val) return true;
  const v = val.trim().toLowerCase();
  return v === '' || v === 'none' || v === 'null' || v === 'blank' || v === 'nan' || v==='NONE';
};

const isValidEmail = (email) => {
  if (isSpecialEmpty(email)) return true;
  const trimmed = email.trim();
  // Loosened: just check for '@' and not empty
  return trimmed.length > 0 && trimmed.includes('@');
};

const isValidPhoneNumber = (phone) => {
  if (isSpecialEmpty(phone)) return true;
  // Loosened: accept if at least 7 digits
  const digits = phone.replace(/[^0-9]/g, '');
  return digits.length >= 7;
};

const isValidYearLevel = (year) => {
  if (!year) return false;
  const validLevels = [
    'first year',
    'second year',
    'third year',
    'fourth year'
  ];
  return validLevels.includes(year.trim().toLowerCase());
}; 