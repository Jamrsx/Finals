// Create a Web Worker for CSV processing
const createCSVWorker = () => {
  const workerCode = `
    // Pre-compile regex patterns
    const PHONE_REGEX = /e\\+?\\d+/i;
    const DIGITS_REGEX = /[^0-9]/g;
    const VALID_LEVELS = new Set(['first year', 'second year', 'third year', 'fourth year']);
    const NONE_VALUES = new Set(['none', 'NONE', 'None', '']);
    
    // Pre-allocate arrays for better performance
    const createArray = (size) => new Array(size);
    
    // Optimized string operations
    const trim = (str) => str.trim();
    const toLower = (str) => str.toLowerCase();
    
    // Check if value is NONE or empty
    const isNoneOrEmpty = (val) => {
      if (!val) return true;
      return NONE_VALUES.has(trim(toLower(val)));
    };
    
    self.onmessage = function(e) {
      const { text } = e.data;
      
      // Use more efficient string splitting
      const lines = text.split(/\\r?\\n/);
      const headerMap = new Map();
      const headers = lines[0].split(',');
      
      // Pre-process headers
      for (let i = 0; i < headers.length; i++) {
        headerMap.set(trim(toLower(headers[i])), i);
      }

      const phoneHeaderKey = headerMap.has('phone_number') ? 'phone_number' : 
                           headerMap.has('phone_nu') ? 'phone_nu' : null;

      const requiredFields = ['student_id', 'lname', 'fname', 'email', phoneHeaderKey, 'gender', 'course', 'yearlevel', 'section'];
      const missingHeaders = requiredFields.filter(h => !headerMap.has(h));

      if (missingHeaders.length > 0 || !phoneHeaderKey) {
        self.postMessage({ error: \`Missing required columns: \${missingHeaders.join(', ')}\` });
        return;
      }

      const students = createArray(lines.length - 1);
      const errors = [];
      const headerLength = headers.length;
      let studentIndex = 0;

      // Process in parallel chunks
      const processChunk = (start, end) => {
        const chunkStudents = [];
        const chunkErrors = [];
        
        for (let i = start; i < end && i < lines.length; i++) {
          const line = lines[i];
          if (!line) continue;
          
          const values = line.split(',');
          const rowNum = i + 1;

          if (values.length < headerLength) {
            chunkErrors.push(\`Row \${rowNum}: Missing values. Expected \${headerLength} columns, got \${values.length}\`);
            continue;
          }

          // Optimized value lookup
          const getValue = (field) => {
            const idx = headerMap.get(field);
            return idx !== undefined ? trim(values[idx]) : '';
          };

          let phoneValue = getValue(phoneHeaderKey);
          if (PHONE_REGEX.test(phoneValue)) {
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
            selected: false
          };

          const validationError = validateStudent(student, rowNum);
          if (validationError) {
            chunkErrors.push(validationError);
          } else {
            chunkStudents.push(student);
          }
        }
        
        return { students: chunkStudents, errors: chunkErrors };
      };

      // Calculate optimal number of workers based on available cores
      const numWorkers = navigator.hardwareConcurrency || 4;
      const optimalChunkSize = Math.ceil((lines.length - 1) / numWorkers);
      const promises = [];

      // Process chunks in parallel
      for (let i = 1; i < lines.length; i += optimalChunkSize) {
        promises.push(new Promise(resolve => {
          const result = processChunk(i, i + optimalChunkSize);
          resolve(result);
        }));
      }

      // Combine results
      Promise.all(promises).then(results => {
        const allStudents = [];
        const allErrors = [];
        
        results.forEach(({ students, errors }) => {
          allStudents.push(...students);
          allErrors.push(...errors);
        });

        self.postMessage({ 
          students: allStudents,
          errors: allErrors
        });
      });
    };

    // Optimized validation functions
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

      for (const [field, label] of Object.entries(requiredFields)) {
        if (!student[field]?.trim()) {
          return \`Row \${rowNumber}: \${label} is required\`;
        }
      }

      if (!isValidEmail(student.email)) {
        return \`Row \${rowNumber}: Invalid email format\`;
      }

      if (!isValidPhoneNumber(student.Phone_number)) {
        return \`Row \${rowNumber}: Invalid phone number format\`;
      }

      if (!isValidYearLevel(student.yearlevel)) {
        return \`Row \${rowNumber}: Invalid year level\`;
      }

      return null;
    };

    const isValidEmail = (email) => {
      if (isNoneOrEmpty(email)) return true;
      return email.includes('@');
    };

    const isValidPhoneNumber = (phone) => {
      if (isNoneOrEmpty(phone)) return true;
      const digits = phone.replace(DIGITS_REGEX, '');
      return digits.length >= 7;
    };

    const isValidYearLevel = (year) => {
      if (!year?.trim()) return false;
      return VALID_LEVELS.has(trim(toLower(year)));
    };
  `;

  const blob = new Blob([workerCode], { type: 'application/javascript' });
  return new Worker(URL.createObjectURL(blob));
};

export const processCSV = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const worker = createCSVWorker();
        
        worker.onmessage = (event) => {
          if (event.data.error) {
            reject(new Error(event.data.error));
          } else {
            resolve(event.data);
          }
          worker.terminate();
        };

        worker.onerror = (error) => {
          reject(new Error('Error in CSV processing worker: ' + error.message));
          worker.terminate();
        };

        worker.postMessage({
          text: e.target.result
        });
      } catch (error) {
        reject(new Error('Error processing CSV file: ' + error.message));
      }
    };

    reader.onerror = () => reject(new Error('Error reading file'));
    reader.readAsText(file);
  });
};


export const toggleSelectAll = (students, selected) => {
  const result = new Array(students.length);
  for (let i = 0; i < students.length; i++) {
    result[i] = { ...students[i], selected };
  }
  return result;
};

export const getSelectedStudents = (students) => {
  const result = [];
  for (let i = 0; i < students.length; i++) {
    if (students[i].selected) {
      result.push(students[i]);
    }
  }
  return result;
};


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