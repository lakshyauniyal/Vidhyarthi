import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js';
import { getAuth, onAuthStateChanged, signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js';
import { getDatabase, ref, get, set, push } from 'https://www.gstatic.com/firebasejs/11.6.0/firebase-database.js';

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyBzguLoHs-7yrbSal8IBDqnKL8MWwlUJZA",
    authDomain: "tmcp-a366e.firebaseapp.com",
    databaseURL: "https://tmcp-a366e-default-rtdb.firebaseio.com",
    projectId: "tmcp-a366e",
    storageBucket: "tmcp-a366e.firebasestorage.app",
    messagingSenderId: "136159734708",
    appId: "1:136159734708:web:5f33b5cd7535c09227e0e1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

// Common Data
const semesterSubjects = {
    '1': ['English', 'Applied Maths 1', 'Applied Physics 1', 'FIT'],
    '2': ['AIT', 'Applied Maths 2', 'Applied Physics 2', 'AE', 'EG', 'MMA', 'EVS'],
    '3': ['OS', 'PIC', 'DBMS', 'DE'],
    '4': ['English 2', 'COA', 'DS', 'OOPS', 'MOOCS'],
    '5': ['WT', 'Python', 'CN', 'Cloud', 'MOOCS'],
    '6': ['NS', 'SE', 'EDM']
};

// Apply Theme
function applyTheme(theme) {
    const html = document.documentElement;
    html.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
}

// Initialize Theme
function initializeTheme() {
    const savedTheme = localStorage.getItem('theme') || 'system';
    applyTheme(savedTheme);
    const themeSelect = document.getElementById('themeSelect');
    if (themeSelect) {
        themeSelect.value = savedTheme;
    }
}

// Common Sidebar Toggle and Settings
function initializeSidebar() {
    const hamburger = document.querySelector('.hamburger');
    const sidebar = document.querySelector('.sidebar');
    const closeSidebar = document.querySelector('.close-sidebar');
    const settingsBtn = document.querySelector('.settings-btn');
    const settingsModal = document.getElementById('settingsModal');

    hamburger?.addEventListener('click', () => {
        sidebar.classList.toggle('active');
    });

    closeSidebar?.addEventListener('click', () => {
        sidebar.classList.remove('active');
    });

    settingsBtn?.addEventListener('click', () => {
        if (settingsModal) {
            settingsModal.classList.add('open');
        }
    });
}

// Common Settings Functionality
function initializeSettings() {
    const settingsModal = document.getElementById('settingsModal');
    const settingsForm = document.getElementById('settingsForm');
    const closeBtn = settingsModal?.querySelector('.close-btn');
    const cancelBtn = document.getElementById('cancelSettingsBtn');
    const settingsStatus = document.getElementById('settingsStatus');
    const themeSelect = document.getElementById('themeSelect');
    const newPassword = document.getElementById('newPassword');
    const confirmPassword = document.getElementById('confirmPassword');

    // Close modal on outside click
    settingsModal?.addEventListener('click', (e) => {
        if (e.target === settingsModal) {
            settingsModal.classList.remove('open');
        }
    });

    // Close modal buttons
    closeBtn?.addEventListener('click', () => {
        settingsModal.classList.remove('open');
    });

    cancelBtn?.addEventListener('click', () => {
        settingsModal.classList.remove('open');
    });

    // Theme change
    themeSelect?.addEventListener('change', (e) => {
        const theme = e.target.value;
        applyTheme(theme);
    });

    // Password change
    settingsForm?.addEventListener('submit', async (e) => {
        e.preventDefault();

        const newPass = newPassword.value.trim();
        const confirmPass = confirmPassword.value.trim();

        if (!newPass && !confirmPass) {
            // Only theme change, no password update
            settingsStatus.textContent = 'Theme updated successfully';
            settingsStatus.classList.add('success-message');
            settingsStatus.style.display = 'block';
            setTimeout(() => {
                settingsStatus.style.display = 'none';
                settingsStatus.classList.remove('success-message');
            }, 3000);
            return;
        }

        if (newPass !== confirmPass) {
            settingsStatus.textContent = 'Passwords do not match';
            settingsStatus.classList.add('error-message');
            settingsStatus.style.display = 'block';
            setTimeout(() => {
                settingsStatus.style.display = 'none';
                settingsStatus.classList.remove('error-message');
            }, 3000);
            return;
        }

        if (newPass.length < 6) {
            settingsStatus.textContent = 'Password must be at least 6 characters';
            settingsStatus.classList.add('error-message');
            settingsStatus.style.display = 'block';
            setTimeout(() => {
                settingsStatus.style.display = 'none';
                settingsStatus.classList.remove('error-message');
            }, 3000);
            return;
        }

        const user = auth.currentUser;
        if (!user) {
            settingsStatus.textContent = 'User not authenticated';
            settingsStatus.classList.add('error-message');
            settingsStatus.style.display = 'block';
            setTimeout(() => {
                settingsStatus.style.display = 'none';
                settingsStatus.classList.remove('error-message');
            }, 3000);
            return;
        }

        try {
            await updatePassword(user, newPass);
            settingsStatus.textContent = 'Password updated successfully';
            settingsStatus.classList.add('success-message');
            settingsStatus.style.display = 'block';
            setTimeout(() => {
                settingsStatus.style.display = 'none';
                settingsStatus.classList.remove('success-message');
                settingsModal.classList.remove('open');
                settingsForm.reset();
            }, 3000);
        } catch (error) {
            console.error('Password update error:', error);
            let errorMessage = 'Error updating password';
            if (error.code === 'auth/requires-recent-login') {
                errorMessage = 'Please re-login to update your password';
            } else if (error.code === 'auth/weak-password') {
                errorMessage = 'Password must be at least 6 characters';
            }
            settingsStatus.textContent = errorMessage;
            settingsStatus.classList.add('error-message');
            settingsStatus.style.display = 'block';
            setTimeout(() => {
                settingsStatus.style.display = 'none';
                settingsStatus.classList.remove('error-message');
            }, 3000);
        }
    });

    // Initialize theme
    initializeTheme();
}

// Common Logout Functionality
function initializeLogout() {
    const logoutBtn = document.getElementById('logoutBtn') || document.querySelector('.logout-btn');
    logoutBtn?.addEventListener('click', () => {
        signOut(auth).then(() => {
            localStorage.removeItem('studentRollNo');
            localStorage.removeItem('studentData');
            window.location.href = 'login.html';
        }).catch((error) => {
            console.error('Logout error:', error);
            alert('Error logging out');
        });
    });
}

// Index Page Functionality
function initIndexPage() {
    function loadStudentData(rollNo) {
        const studentData = JSON.parse(localStorage.getItem('studentData'));
        if (studentData) {
            document.getElementById('profileName').textContent = studentData.name || 'N/A';
            document.getElementById('profileEmail').textContent = studentData.email || 'N/A';
            document.getElementById('profileRollNo').textContent = rollNo;
            document.getElementById('profileBranch').textContent = studentData.branch || 'N/A';
            document.getElementById('profileSemester').textContent = studentData.semester || 'N/A';
            fetchSessionalMarks(rollNo, studentData.semester || '5');
            fetchLeaveHistory(rollNo); // Load leave history on page load
        } else {
            console.error('No student data in localStorage, fetching from DB');
            fetchStudentData(rollNo);
        }
    }

    async function fetchStudentData(rollNo) {
        try {
            const studentRef = ref(database, `students/${rollNo}`);
            const snapshot = await get(studentRef);
            const data = snapshot.val();
            if (data) {
                localStorage.setItem('studentData', JSON.stringify(data));
                document.getElementById('profileName').textContent = data.name || 'N/A';
                document.getElementById('profileEmail').textContent = data.email || 'N/A';
                document.getElementById('profileRollNo').textContent = rollNo;
                document.getElementById('profileBranch').textContent = data.branch || 'N/A';
                document.getElementById('profileSemester').textContent = data.semester || 'N/A';
                fetchSessionalMarks(rollNo, data.semester || '5');
                fetchLeaveHistory(rollNo); // Load leave history after fetching student data
            } else {
                throw new Error('Student data not found');
            }
        } catch (error) {
            console.error('Error fetching student data:', error);
            alert('Error fetching data: ' + error.message);
        }
    }

    async function fetchSessionalMarks(rollNo, semester) {
        try {
            const marksRef = ref(database, `sessional_marks/${rollNo}/${semester}`);
            const snapshot = await get(marksRef);
            const marksData = snapshot.val() || {};

            const subjects = semesterSubjects[semester] || semesterSubjects['5'];
            let sessional1Total = 0, sessional2Total = 0, sessional3Total = 0;
            let sessional1Count = 0, sessional2Count = 0, sessional3Count = 0;

            subjects.forEach(subject => {
                const subjectMarks = marksData[subject] || {};
                const s1 = subjectMarks.sessional1;
                const s2 = subjectMarks.sessional2;
                const s3 = subjectMarks.sessional3;

                if (s1 !== undefined) {
                    sessional1Total += s1;
                    sessional1Count++;
                }
                if (s2 !== undefined) {
                    sessional2Total += s2;
                    sessional2Count++;
                }
                if (s3 !== undefined) {
                    sessional3Total += s3;
                    sessional3Count++;
                }
            });

            const maxMarks = 30;
            const sessional1Percentage = sessional1Count > 0 ? ((sessional1Total / (sessional1Count * maxMarks)) * 100).toFixed(2) : 'N/A';
            const sessional2Percentage = sessional2Count > 0 ? ((sessional2Total / (sessional2Count * maxMarks)) * 100).toFixed(2) : 'N/A';
            const sessional3Percentage = sessional3Count > 0 ? ((sessional3Total / (sessional3Count * maxMarks)) * 100).toFixed(2) : 'N/A';

            document.getElementById('sessional1Percentage').textContent = sessional1Percentage === 'N/A' ? 'N/A' : `${sessional1Percentage}%`;
            document.getElementById('sessional2Percentage').textContent = sessional2Percentage === 'N/A' ? 'N/A' : `${sessional2Percentage}%`;
            document.getElementById('sessional3Percentage').textContent = sessional3Percentage === 'N/A' ? 'N/A' : `${sessional3Percentage}%`;
        } catch (error) {
            console.error('Error fetching sessional marks:', error);
            document.getElementById('sessional1Percentage').textContent = 'N/A';
            document.getElementById('sessional2Percentage').textContent = 'N/A';
            document.getElementById('sessional3Percentage').textContent = 'N/A';
        }
    }

    async function fetchLeaveHistory(rollNo) {
        const leaveHistoryBody = document.getElementById('leaveHistoryBody');
        if (!leaveHistoryBody) return;

        try {
            const leaveRef = ref(database, `leaveRequests/${rollNo}`);
            const snapshot = await get(leaveRef);
            const leaveData = snapshot.val() || {};

            leaveHistoryBody.innerHTML = ''; // Clear existing rows

            if (Object.keys(leaveData).length === 0) {
                const row = document.createElement('tr');
                row.innerHTML = `<td colspan="3">No leave requests found</td>`;
                leaveHistoryBody.appendChild(row);
                return;
            }

            // Convert to array and sort by timestamp (newest first)
            const leaveArray = Object.entries(leaveData).map(([id, data]) => ({
                id,
                ...data
            }));
            leaveArray.sort((a, b) => b.timestamp - a.timestamp);

            leaveArray.forEach(leave => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${leave.date}</td>
                    <td>${leave.reason}</td>
                    <td>${leave.status}</td>
                `;
                leaveHistoryBody.appendChild(row);
            });
        } catch (error) {
            console.error('Error fetching leave history:', error);
            leaveHistoryBody.innerHTML = `<tr><td colspan="3">Error loading leave history</td></tr>`;
        }
    }

    const leaveForm = document.getElementById('leaveForm');
    leaveForm?.addEventListener('submit', async (e) => {
        e.preventDefault();

        const rollNo = localStorage.getItem('studentRollNo');
        if (!rollNo) {
            const leaveStatus = document.getElementById('leaveStatus');
            if (leaveStatus) {
                leaveStatus.textContent = 'User not authenticated. Please log in.';
                leaveStatus.style.color = 'var(--error-color)';
            }
            return;
        }

        const date = document.getElementById('leaveDate').value;
        const reason = document.getElementById('leaveReason').value.trim();
        const leaveStatus = document.getElementById('leaveStatus');

        if (!date || !reason) {
            if (leaveStatus) {
                leaveStatus.textContent = 'Please provide both date and reason.';
                leaveStatus.style.color = 'var(--error-color)';
            }
            return;
        }

        try {
            const leaveRef = ref(database, `leaveRequests/${rollNo}`);
            const newLeaveRef = push(leaveRef); // Generate unique request ID
            await set(newLeaveRef, {
                date,
                reason,
                rollNo,
                status: 'Pending',
                timestamp: Date.now()
            });

            if (leaveStatus) {
                leaveStatus.textContent = 'Leave request submitted successfully.';
                leaveStatus.style.color = 'var(--success-color)';
                leaveForm.reset();
                fetchLeaveHistory(rollNo); // Refresh leave history
                setTimeout(() => {
                    leaveStatus.textContent = '';
                }, 3000);
            }
        } catch (error) {
            console.error('Error submitting leave request:', error);
            if (leaveStatus) {
                leaveStatus.textContent = 'Error submitting leave request: ' + error.message;
                leaveStatus.style.color = 'var(--error-color)';
            }
        }
    });

    onAuthStateChanged(auth, (user) => {
        if (!user) {
            window.location.href = 'login.html';
            return;
        }

        const rollNo = localStorage.getItem('studentRollNo');
        if (!rollNo) {
            console.error('No roll number found in localStorage');
            signOut(auth).then(() => window.location.href = 'login.html');
            return;
        }

        loadStudentData(rollNo);
    });
}

// Login Page Functionality
function initLoginPage() {
    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('errorMessage');

    loginForm?.addEventListener('submit', async (e) => {
        e.preventDefault();

        const rollNo = document.getElementById('rollNo').value.trim().toUpperCase();
        const password = document.getElementById('password').value;

        try {
            const studentRef = ref(database, `students/${rollNo}`);
            const studentSnapshot = await get(studentRef);

            if (!studentSnapshot.exists()) {
                throw new Error('Invalid roll number');
            }

            const studentData = studentSnapshot.val();
            const email = studentData.email;

            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            console.log('User signed in:', userCredential.user);

            localStorage.setItem('studentRollNo', rollNo);
            localStorage.setItem('studentData', JSON.stringify(studentData));

            window.location.href = 'index.html';
        } catch (error) {
            console.error('Login error:', error);
            if (errorMessage) {
                errorMessage.textContent = error.message === 'Invalid roll number'
                    ? 'Invalid roll number'
                    : (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential')
                    ? 'Incorrect password'
                    : error.code === 'auth/user-not-found'
                    ? 'User not found, please sign up'
                    : 'Login error: ' + error.message;
                errorMessage.style.display = 'block';
                setTimeout(() => errorMessage.style.display = 'none', 3000);
            }
        }
    });
}

// Signup Page Functionality
function initSignupPage() {
    const signupForm = document.getElementById('signupForm');
    const rollNoInput = document.getElementById('rollNo');
    const passwordGroup = document.getElementById('passwordGroup');
    const passwordInput = document.getElementById('password');
    const errorMessage = document.getElementById('errorMessage');
    const successMessage = document.getElementById('successMessage');

    // Hide password field by default
    if (passwordGroup) {
        passwordGroup.style.display = 'none';
        passwordInput.required = false;
    }

    rollNoInput?.addEventListener('blur', async () => {
        const rollNo = rollNoInput.value.trim().toUpperCase();
        if (rollNo) {
            try {
                const studentRef = ref(database, `students/${rollNo}`);
                const snapshot = await get(studentRef);
                
                if (snapshot.exists()) {
                    passwordGroup.style.display = 'block';
                    passwordInput.required = true;
                } else {
                    passwordGroup.style.display = 'none';
                    passwordInput.required = false;
                    if (errorMessage) {
                        errorMessage.style.display = 'block';
                        errorMessage.textContent = 'Invalid Roll Number';
                        setTimeout(() => errorMessage.style.display = 'none', 3000);
                    }
                }
            } catch (error) {
                console.error('Error checking roll number:', error);
                passwordGroup.style.display = 'none';
                passwordInput.required = false;
                if (errorMessage) {
                    errorMessage.style.display = 'block';
                    errorMessage.textContent = 'Error checking roll number';
                    setTimeout(() => errorMessage.style.display = 'none', 3000);
                }
            }
        } else {
            passwordGroup.style.display = 'none';
            passwordInput.required = false;
        }
    });

    signupForm?.addEventListener('submit', async (e) => {
        e.preventDefault();

        const rollNo = rollNoInput.value.trim().toUpperCase();
        const password = passwordInput.value;

        try {
            const studentRef = ref(database, `students/${rollNo}`);
            const studentSnapshot = await get(studentRef);

            if (!studentSnapshot.exists()) {
                if (errorMessage) {
                    errorMessage.style.display = 'block';
                    errorMessage.textContent = 'Invalid Roll Number';
                    setTimeout(() => errorMessage.style.display = 'none', 3000);
                }
                return;
            }

            // Validate password if roll number exists
            if (passwordInput.required && !password) {
                if (errorMessage) {
                    errorMessage.style.display = 'block';
                    errorMessage.textContent = 'Password is required';
                    setTimeout(() => errorMessage.style.display = 'none', 3000);
                }
                return;
            }

            const studentData = studentSnapshot.val();
            const email = studentData.email;

            const credentialRef = ref(database, `studentCredentials/${rollNo}`);
            const credentialSnapshot = await get(credentialRef);

            if (credentialSnapshot.exists()) {
                if (errorMessage) {
                    errorMessage.style.display = 'block';
                    errorMessage.textContent = 'This roll number is already registered';
                    setTimeout(() => errorMessage.style.display = 'none', 3000);
                }
                return;
            }

            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            console.log('User created:', userCredential.user);

            await set(ref(database, `studentCredentials/${rollNo}`), {
                email: email,
                uid: userCredential.user.uid,
                createdAt: Date.now()
            });

            if (successMessage) {
                successMessage.style.display = 'block';
                setTimeout(() => {
                    successMessage.style.display = 'none';
                    window.location.href = 'login.html';
                }, 2000);
            }
        } catch (error) {
            console.error('Signup error:', error);
            if (errorMessage) {
                errorMessage.style.display = 'block';
                errorMessage.textContent = error.code === 'auth/email-already-in-use'
                    ? 'This roll number is already registered'
                    : error.code === 'auth/weak-password'
                    ? 'Password must be at least 6 characters'
                    : 'Signup error: ' + error.message;
                setTimeout(() => errorMessage.style.display = 'none', 3000);
            }
        }
    });
}

// Marks Page Functionality
function initMarksPage() {
    async function loadMarksData(rollNo, semester) {
        const loader = document.querySelector('.loader');
        const marksStatus = document.getElementById('marksStatus');

        if (loader) loader.style.display = 'flex';
        if (marksStatus) {
            marksStatus.textContent = 'Loading marks...';
            marksStatus.style.color = 'var(--text-color)';
            marksStatus.style.display = 'block';
        }

        try {
            const subjects = semesterSubjects[semester] || [];
            if (subjects.length === 0) {
                throw new Error('No subjects found for this semester');
            }

            const marksRef = ref(database, `sessional_marks/${rollNo}/${semester}`);
            const marksSnapshot = await get(marksRef);
            const marksData = marksSnapshot.val() || {};

            populateMarks(subjects, marksData);

            if (marksStatus) {
                marksStatus.textContent = `Marks loaded for Semester ${semester}`;
                marksStatus.style.color = 'var(--notification-success-bg)';
                setTimeout(() => {
                    marksStatus.style.display = 'none';
                }, 3000);
            }
        } catch (error) {
            console.error('Error fetching marks data:', error);
            const semester = JSON.parse(localStorage.getItem('studentData'))?.semester || '5';
            const subjects = semesterSubjects[semester] || semesterSubjects['5'];
            populateMarks(subjects, {});
            if (marksStatus) {
                marksStatus.textContent = 'Error loading marks: ' + error.message;
                marksStatus.style.color = 'var(--notification-error-bg)';
                setTimeout(() => {
                    marksStatus.style.display = 'none';
                }, 3000);
            }
        } finally {
            if (loader) loader.style.display = 'none';
        }
    }

    function populateMarks(subjects, marksData) {
        const sessional1Marks = document.getElementById('sessional1Marks');
        const sessional2Marks = document.getElementById('sessional2Marks');
        const sessional3Marks = document.getElementById('sessional3Marks');

        if (sessional1Marks) {
            sessional1Marks.innerHTML = '';
            subjects.forEach(subject => {
                const marks = marksData[subject]?.sessional1 ?? 'N/A';
                const tr = document.createElement('tr');
                tr.innerHTML = `<td>${subject}</td><td>${marks}</td>`;
                sessional1Marks.appendChild(tr);
            });
        }

        if (sessional2Marks) {
            sessional2Marks.innerHTML = '';
            subjects.forEach(subject => {
                const marks = marksData[subject]?.sessional2 ?? 'N/A';
                const tr = document.createElement('tr');
                tr.innerHTML = `<td>${subject}</td><td>${marks}</td>`;
                sessional2Marks.appendChild(tr);
            });
        }

        if (sessional3Marks) {
            sessional3Marks.innerHTML = '';
            subjects.forEach(subject => {
                const marks = marksData[subject]?.sessional3 ?? 'N/A';
                const tr = document.createElement('tr');
                tr.innerHTML = `<td>${subject}</td><td>${marks}</td>`;
                sessional3Marks.appendChild(tr);
            });
        }
    }

    onAuthStateChanged(auth, (user) => {
        if (!user) {
            window.location.href = 'login.html';
            return;
        }

        const rollNo = localStorage.getItem('studentRollNo');
        if (!rollNo) {
            console.error('No roll number found in localStorage');
            signOut(auth).then(() => window.location.href = 'login.html');
            return;
        }

        const studentData = JSON.parse(localStorage.getItem('studentData'));
        const initialSemester = studentData?.semester || '5';
        const semesterSelect = document.getElementById('semesterSelect');

        if (semesterSelect) {
            semesterSelect.value = initialSemester;
            loadMarksData(rollNo, initialSemester);

            semesterSelect.addEventListener('change', (e) => {
                const selectedSemester = e.target.value;
                if (selectedSemester) {
                    loadMarksData(rollNo, selectedSemester);
                } else {
                    const sessional1Marks = document.getElementById('sessional1Marks');
                    const sessional2Marks = document.getElementById('sessional2Marks');
                    const sessional3Marks = document.getElementById('sessional3Marks');
                    const marksStatus = document.getElementById('marksStatus');
                    if (sessional1Marks) sessional1Marks.innerHTML = '';
                    if (sessional2Marks) sessional2Marks.innerHTML = '';
                    if (sessional3Marks) sessional3Marks.innerHTML = '';
                    if (marksStatus) {
                        marksStatus.textContent = 'Please select a semester.';
                        marksStatus.style.color = 'var(--notification-error-bg)';
                        marksStatus.style.display = 'block';
                        setTimeout(() => {
                            marksStatus.style.display = 'none';
                        }, 3000);
                    }
                }
            });
        }
    });
}

// Profile Page Functionality
function initProfilePage() {
    const profileName = document.getElementById('profileName');
    const profileRollNo = document.getElementById('profileRollNo');
    const profileFatherName = document.getElementById('profileFatherName');
    const profileBranch = document.getElementById('profileBranch');
    const profileSemester = document.getElementById('profileSemester');
    const profileMobile = document.getElementById('profileMobile');
    const profileEmail = document.getElementById('profileEmail');

    const editProfileBtn = document.getElementById('editProfileBtn');
    const editProfileModal = document.getElementById('editProfileModal');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const cancelEditBtn = document.getElementById('cancelEditBtn');
    const editProfileForm = document.getElementById('editProfileForm');
    const editName = document.getElementById('editName');
    const editRollNo = document.getElementById('editRollNo');
    const editFatherName = document.getElementById('editFatherName');
    const editBranch = document.getElementById('editBranch');
    const editSemester = document.getElementById('editSemester');
    const editMobile = document.getElementById('editMobile');
    const editEmail = document.getElementById('editEmail');

    editProfileBtn?.addEventListener('click', () => {
        if (editProfileModal) editProfileModal.classList.add('open');
    });

    closeModalBtn?.addEventListener('click', () => {
        if (editProfileModal) editProfileModal.classList.remove('open');
    });

    cancelEditBtn?.addEventListener('click', () => {
        if (editProfileModal) editProfileModal.classList.remove('open');
    });

    editProfileForm?.addEventListener('submit', async (e) => {
        e.preventDefault();

        const name = editName.value.trim();
        const rollNo = editRollNo.value.trim();
        const fatherName = editFatherName.value.trim();
        const branch = editBranch.value;
        const semester = editSemester.value;
        const mobile = editMobile.value.trim();
        const email = editEmail.value.trim();

        if (!name || !rollNo || !fatherName || !branch || !semester || !mobile || !email) {
            alert('Please fill all required fields');
            return;
        }

        if (!/^[0-9]{10}$/.test(mobile)) {
            alert('Mobile number must be 10 digits');
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            alert('Please enter a valid email address');
            return;
        }

        const updatedProfile = {
            name,
            rollNo,
            fatherName,
            branch,
            semester,
            mobile,
            email,
            updatedAt: Date.now()
        };

        try {
            console.log('Updating profile with:', updatedProfile);
            const studentRef = ref(database, `students/${rollNo}`);
            await set(studentRef, updatedProfile);
            localStorage.setItem('studentData', JSON.stringify(updatedProfile));
            displayProfileData(updatedProfile, rollNo);
            if (editProfileModal) editProfileModal.classList.remove('open');
            alert('Profile updated successfully');
        } catch (error) {
            console.error('Error updating profile:', {
                message: error.message,
                code: error.code,
                details: error
            });
            let errorMessage = 'Error updating profile';
            if (error.code === 'PERMISSION_DENIED') {
                errorMessage = 'Permission denied: Check Firebase database rules';
            } else if (error.code === 'NETWORK_ERROR') {
                errorMessage = 'Network error: Please check your connection';
            }
            alert(`${errorMessage}. Details: ${error.message}`);
        }
    });

    function displayProfileData(profileData, rollNo) {
        if (profileName) profileName.textContent = profileData.name || 'N/A';
        if (profileRollNo) profileRollNo.textContent = profileData.rollNo || rollNo;
        if (profileFatherName) profileFatherName.textContent = profileData.fatherName || 'N/A';
        if (profileBranch) profileBranch.textContent = profileData.branch || 'N/A';
        if (profileSemester) profileSemester.textContent = profileData.semester || 'N/A';
        if (profileMobile) profileMobile.textContent = profileData.mobile || 'N/A';
        if (profileEmail) profileEmail.textContent = profileData.email || 'N/A';
    }

    function populateEditForm(profileData, rollNo) {
        if (editName) editName.value = profileData.name || '';
        if (editRollNo) editRollNo.value = profileData.rollNo || rollNo;
        if (editFatherName) editFatherName.value = profileData.fatherName || '';
        if (editBranch) editBranch.value = profileData.branch || '';
        if (editSemester) editSemester.value = profileData.semester || '';
        if (editMobile) editMobile.value = profileData.mobile || '';
        if (editEmail) editEmail.value = profileData.email || '';
    }

    async function loadProfileDataFromFirebase(rollNo) {
        try {
            const profileRef = ref(database, `students/${rollNo}`);
            const snapshot = await get(profileRef);

            if (!snapshot.exists()) {
                alert('Profile not found');
                window.location.href = 'login.html';
                return;
            }

            const profileData = snapshot.val();
            localStorage.setItem('studentData', JSON.stringify(profileData));
            displayProfileData(profileData, rollNo);
            populateEditForm(profileData, rollNo);
        } catch (error) {
            console.error('Error loading profile from Firebase:', error);
            alert('Error loading profile data');
        }
    }

    onAuthStateChanged(auth, (user) => {
        if (!user) {
            window.location.href = 'login.html';
            return;
        }

        const rollNo = localStorage.getItem('studentRollNo');
        if (!rollNo) {
            alert('Please login first');
            window.location.href = 'login.html';
            return;
        }

        const studentData = JSON.parse(localStorage.getItem('studentData'));
        if (studentData) {
            displayProfileData(studentData, rollNo);
            populateEditForm(studentData, rollNo);
        } else {
            loadProfileDataFromFirebase(rollNo);
        }
    });
}

// Syllabus Page Functionality
function initSyllabusPage() {
    const syllabusLinks = {
        '1': 'syllabus/sem1.pdf',
        '2': 'syllabus/sem2.pdf',
        '3': 'syllabus/sem3.pdf',
        '4': 'syllabus/sem4.pdf',
        '5': 'syllabus/sem5.pdf',
        '6': 'syllabus/sem6.pdf'
    };

    async function loadSyllabusData(rollNo) {
        const semesterSelect = document.getElementById('semesterSelect');
        const syllabusLink = document.getElementById('syllabusLink');

        if (!semesterSelect || !syllabusLink) return;

        try {
            const studentData = JSON.parse(localStorage.getItem('studentData'));
            let studentSemester = studentData?.semester || '1';

            if (!studentData) {
                const studentSnapshot = await get(ref(database, `students/${rollNo}`));
                const fetchedData = studentSnapshot.val();
                if (!fetchedData) {
                    throw new Error('Student data not found');
                }
                studentSemester = fetchedData.semester || '1';
                localStorage.setItem('studentData', JSON.stringify(fetchedData));
            }

            semesterSelect.value = studentSemester;
            updateSyllabusLink(studentSemester);
        } catch (error) {
            console.error('Error fetching student data:', error);
            alert('Error fetching semester: ' + error.message);
            semesterSelect.value = '1';
            updateSyllabusLink('1');
        }

        semesterSelect.addEventListener('change', (e) => {
            const semester = e.target.value;
            updateSyllabusLink(semester);
        });
    }

    function updateSyllabusLink(semester) {
        const syllabusLink = document.getElementById('syllabusLink');
        if (semester && syllabusLinks[semester]) {
            syllabusLink.href = syllabusLinks[semester];
            syllabusLink.style.display = 'inline-block';
        } else {
            syllabusLink.style.display = 'none';
        }
    }

    onAuthStateChanged(auth, (user) => {
        if (!user) {
            window.location.href = 'login.html';
            return;
        }

        const rollNo = localStorage.getItem('studentRollNo');
        if (!rollNo) {
            console.error('No roll number found in localStorage');
            signOut(auth).then(() => window.location.href = 'login.html');
            return;
        }

        loadSyllabusData(rollNo);
    });
}

// Attendance Page Functionality
function initAttendancePage() {
    async function loadAttendanceData(rollNo, semester) {
        const loader = document.querySelector('.loader');
        const attendanceBody = document.getElementById('attendanceBody');
        const attendanceStatus = document.getElementById('attendanceStatus');

        if (!attendanceBody || !attendanceStatus) {
            console.error('Required DOM elements not found');
            return;
        }

        if (loader) loader.style.display = 'flex';

        try {
            const subjects = semesterSubjects[semester] || [];
            attendanceBody.innerHTML = '';

            if (subjects.length === 0) {
                throw new Error('No subjects found for this semester');
            }

            let totalClassesSum = 0;
            let attendedClassesSum = 0;

            for (const subject of subjects) {
                const attendanceRef = ref(database, `attendance/${rollNo}/${subject}`);
                const snapshot = await get(attendanceRef);
                const data = snapshot.val();

                const totalClasses = data?.totalClasses || 0;
                const attendedClasses = data?.attendedClasses || 0;
                const percentage = totalClasses > 0 ? ((attendedClasses / totalClasses) * 100).toFixed(2) : '0.00';

                totalClassesSum += totalClasses;
                attendedClassesSum += attendedClasses;

                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${subject}</td>
                    <td>${totalClasses}</td>
                    <td>${attendedClasses}</td>
                    <td>${percentage}%</td>
                `;
                attendanceBody.appendChild(row);
            }

            const totalPercentage = totalClassesSum > 0 ? ((attendedClassesSum / totalClassesSum) * 100).toFixed(2) : '0.00';
            const totalRow = document.createElement('tr');
            totalRow.classList.add('total-row');
            totalRow.innerHTML = `
                <td>Total</td>
                <td>${totalClassesSum}</td>
                <td>${attendedClassesSum}</td>
                <td>${totalPercentage}%</td>
            `;
            attendanceBody.appendChild(totalRow);

            attendanceStatus.textContent = `Total Attendance: ${totalPercentage}%`;
            attendanceStatus.style.color = 'var(--notification-success-bg)';
        } catch (error) {
            console.error('Error fetching attendance:', error);
            attendanceStatus.textContent = 'Error loading attendance: ' + error.message;
            attendanceStatus.style.color = 'var(--notification-error-bg)';
        } finally {
            if (loader) loader.style.display = 'none';
        }
    }

    onAuthStateChanged(auth, (user) => {
        if (!user) {
            window.location.href = 'login.html';
            return;
        }

        const rollNo = localStorage.getItem('studentRollNo');
        if (!rollNo) {
            console.error('No roll number found in localStorage');
            signOut(auth).then(() => window.location.href = 'login.html');
            return;
        }

        let studentData = JSON.parse(localStorage.getItem('studentData'));
        const initialSemester = studentData?.semester || '5';
        const semesterSelect = document.getElementById('semesterSelect');
        if (semesterSelect) {
            semesterSelect.value = initialSemester;
            loadAttendanceData(rollNo, initialSemester);

            semesterSelect.addEventListener('change', (e) => {
                const selectedSemester = e.target.value;
                if (selectedSemester) {
                    loadAttendanceData(rollNo, selectedSemester);
                } else {
                    const attendanceBody = document.getElementById('attendanceBody');
                    const attendanceStatus = document.getElementById('attendanceStatus');
                    if (attendanceBody) attendanceBody.innerHTML = '';
                    if (attendanceStatus) {
                        attendanceStatus.textContent = 'Please select a semester.';
                        attendanceStatus.style.color = 'var(--notification-error-bg)';
                    }
                }
            });
        }
    });
}

function loadLeaveHistory(userId) {
    const leaveHistoryBody = document.getElementById('leaveHistoryBody');
    leaveHistoryBody.innerHTML = ''; // Clear existing rows

    const leavesRef = collection(db, 'users', userId, 'leaves');
    onSnapshot(leavesRef, (snapshot) => {
        snapshot.forEach((doc) => {
            const leave = doc.data();
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${leave.date}</td>
                <td class="leave-reason-cell">${truncateReason(leave.reason)}</td>
                <td>${leave.status || 'Pending'}</td>
            `;
            leaveHistoryBody.appendChild(row);
        });
    }, (error) => {
        console.error('Error fetching leave history:', error);
        leaveHistoryBody.innerHTML = '<tr><td colspan="3">Error loading history</td></tr>';
    });
}

// Initialize Page-Specific Functionality
function initializePage() {
    const path = window.location.pathname;
    const page = path.split('/').pop() || 'index.html';

    // Initialize common functionality
    initializeSidebar();
    initializeSettings();
    initializeLogout();

    // Initialize page-specific functionality
    switch (page) {
        case 'index.html':
            initIndexPage();
            break;
        case 'login.html':
            initLoginPage();
            break;
        case 'signup.html':
            initSignupPage();
            break;
        case 'marks.html':
            initMarksPage();
            break;
        case 'profile.html':
            initProfilePage();
            break;
        case 'syllabus.html':
            initSyllabusPage();
            break;
        case 'attendance.html':
            initAttendancePage();
            break;
        default:
            console.warn('Unknown page:', page);
    }
}

// Run initialization when DOM is loaded
document.addEventListener('DOMContentLoaded', initializePage);