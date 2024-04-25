import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';
import Login from './pages/Login/Login';
import Admin from './pages/Admin/Admin';
import Invite from './pages/Invite/Invite';
import Commit from './pages/Commit/Commit';

import ProjectState from './pages/ProjectState/ProjectState';
import Users from './pages/Admin/components/Users/Users';
import Submissions from './pages/Admin/components/Submissions/Submissions';
import Username from './pages/Username/Username';
import ResetPasswordRequest from './pages/ResetPasswordRequest/ResetPasswordRequest';
import ResetPassword from './pages/ResetPassword/ResetPassword';
import Challenges from './pages/Admin/components/Challenges/Challenges';

export default function App() {
    return (
        <>
            <Router>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/admin">
                        <Route path="" element={<Admin />}></Route>
                        <Route path="user-management" element={<Users />}></Route>
                        <Route
                            path="submissions-management"
                            element={<Submissions />}
                        ></Route>
                        <Route path="exercises-management" element={<Challenges />}></Route>
                    </Route>
                    <Route path="/invite">
                        <Route path=":token" element={<Invite />} />
                    </Route>
                    <Route path="/commit" element={<Commit />} />
                    <Route path="/:username" element={<ProjectState />} />
                    <Route path="/username" element={<Username />} />
                    <Route path="/resetPasswordRequest" element={<ResetPasswordRequest />} />
                    <Route path="/reset-password">
                        <Route path=':token' element={<ResetPassword />} />
                    </Route>
                </Routes>
            </Router>
            <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="colored"
            />
        </>
    );
}
