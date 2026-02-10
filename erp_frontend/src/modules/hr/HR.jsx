import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import HRRoot from './app/HRRoot';

const HR = () => {
    return (
        <Routes>
            <Route path="/hr/*" element={<HRRoot />} />
            <Route path="*" element={<Navigate to="/hr" replace />} />
        </Routes>
    );
};

export default HR;