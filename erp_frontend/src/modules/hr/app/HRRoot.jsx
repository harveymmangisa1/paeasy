import React, { useMemo, useState } from 'react';
import { Routes, Route, useLocation, useNavigate, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import EmployeeModal from './components/EmployeeModal';
import Overview from './pages/Overview';
import Employees from './pages/Employees';
import Attendance from './pages/Attendance';
import LeaveManagement from './pages/LeaveManagement';
import Payroll from './pages/Payroll';
import Performance from './pages/Performance';
import Training from './pages/Training';
import Benefits from './pages/Benefits';
import Documents from './pages/Documents';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import {
    employeesData,
    departmentsData,
    attendanceData,
    leaveRequestsData,
    payrollData,
    performanceData,
    trainingData,
    benefitsData,
    documentsData,
} from './data';

const HRRoot = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const [showEmployeeModal, setShowEmployeeModal] = useState(false);
    const [employees, setEmployees] = useState(employeesData);
    const [departments] = useState(departmentsData);
    const [attendance, setAttendance] = useState(attendanceData);
    const [leaveRequests, setLeaveRequests] = useState(leaveRequestsData);
    const [payroll, setPayroll] = useState(payrollData);
    const [performance, setPerformance] = useState(performanceData);
    const [training, setTraining] = useState(trainingData);
    const [benefits, setBenefits] = useState(benefitsData);
    const [documents, setDocuments] = useState(documentsData);
    const [employeeForm, setEmployeeForm] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        department: '',
        position: '',
        salary: '',
        startDate: '',
        employmentType: 'full-time',
        status: 'active',
    });

    const filteredEmployees = useMemo(() => {
        const query = search.trim().toLowerCase();
        if (!query) return employees;
        return employees.filter((employee) =>
            employee.firstName.toLowerCase().includes(query) ||
            employee.lastName.toLowerCase().includes(query) ||
            employee.email.toLowerCase().includes(query) ||
            employee.department.toLowerCase().includes(query) ||
            employee.position.toLowerCase().includes(query)
        );
    }, [employees, search]);

    const handleEmployeeChange = (field, value) => {
        setEmployeeForm((prev) => ({ ...prev, [field]: value }));
    };

    const submitEmployee = (event) => {
        event.preventDefault();
        const newEmployee = {
            id: `emp-${String(employees.length + 1).padStart(4, '0')}`,
            ...employeeForm,
            fullName: `${employeeForm.firstName} ${employeeForm.lastName}`,
        };
        setEmployees((prev) => [newEmployee, ...prev]);
        setEmployeeForm({
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            department: '',
            position: '',
            salary: '',
            startDate: '',
            employmentType: 'full-time',
            status: 'active',
        });
        setShowEmployeeModal(false);
        navigate('/hr/employees');
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100">
            <div className="flex">
                <Sidebar activePath={location.pathname} onNavigate={navigate} />
                <main className="flex-1 px-8 py-8 bg-[radial-gradient(circle_at_top,_#1f2937,_#0f172a_65%)]">
                    <Topbar search={search} onSearch={setSearch} onAddEmployee={() => setShowEmployeeModal(true)} />

                    <Routes>
                        <Route index element={<Overview employees={employees} payroll={payroll} leaveRequests={leaveRequests} />} />
                        <Route path="employees" element={<Employees employees={filteredEmployees} departments={departments} onAddEmployee={() => setShowEmployeeModal(true)} />} />
                        <Route path="attendance" element={<Attendance attendance={attendance} employees={employees} />} />
                        <Route path="leave" element={<LeaveManagement leaveRequests={leaveRequests} employees={employees} />} />
                        <Route path="payroll" element={<Payroll payroll={payroll} employees={employees} />} />
                        <Route path="performance" element={<Performance performance={performance} employees={employees} />} />
                        <Route path="training" element={<Training training={training} employees={employees} />} />
                        <Route path="benefits" element={<Benefits benefits={benefits} employees={employees} />} />
                        <Route path="documents" element={<Documents documents={documents} employees={employees} />} />
                        <Route path="reports" element={<Reports employees={employees} payroll={payroll} attendance={attendance} />} />
                        <Route path="settings" element={<Settings />} />
                        <Route path="*" element={<Navigate to="/hr" replace />} />
                    </Routes>
                </main>
            </div>

            <EmployeeModal
                open={showEmployeeModal}
                departments={departments}
                employeeForm={employeeForm}
                onChange={handleEmployeeChange}
                onClose={() => setShowEmployeeModal(false)}
                onSubmit={submitEmployee}
            />
        </div>
    );
};

export default HRRoot;