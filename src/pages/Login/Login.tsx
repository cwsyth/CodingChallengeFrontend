import { useEffect, useState } from 'react';
import { Link, useNavigate } from "react-router-dom";
import user from '../../services/user';
import serviceHelper from '../../services/serviceHelper';
import './Login.css';
import { ToastType } from '../../interfaces/ToastType';
import toast from '../../services/toast';
import Loader from '../../components/Loader/Loader';

const Login = () => {
    const [inputValues, setInputValues] = useState({
        email: '',
        password: '',
    });
    const [authenticated, setAuthenticated] = useState<Boolean | null>(null);

    const navigate = useNavigate();

    useEffect(() => {
        const checkLogin = async () => {
            try {
                const res = await user.authenticated();

                if(res.ok) {
                    await serviceHelper.routeBasedOnRole(navigate);
                    setAuthenticated(true);
                }
                else {
                    setAuthenticated(false);
                }
            }
            catch(err) {
                toast.showToast(ToastType.ERROR, 'Connection error. Try again later.');
            }
        };
        checkLogin();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValues({
            ...inputValues,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        try {
            const res = await user.login(inputValues.email, inputValues.password);

            if(res.ok) {
                toast.showToast(ToastType.SUCCESS, 'login successful');
                setTimeout(async () => {
                    await serviceHelper.routeBasedOnRole(navigate);
                }, 2000);
            }
            else {
                toast.showToast(ToastType.ERROR, toast.httpError(res.status, 'Invalid email or password'));
            }
        }
        catch(err) {
            toast.showToast(ToastType.ERROR, 'Connection error. Try again later.');
        }
    };

    return (
        <div className="center">
            {
                authenticated === null ? (
                    <Loader height={32} width={32} borderWidth={5}/>
                ) : (
                    <form className="login-form" onSubmit={handleSubmit}>
                        <div className="input-with-label">
                            <label htmlFor="email">email:</label>
                            <input
                                type="text"
                                name="email"
                                value={inputValues.email}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="input-with-label">
                            <label htmlFor="password">password:</label>
                            <input
                                type="password"
                                name="password"
                                value={inputValues.password}
                                onChange={handleChange}
                            />
                        </div>
                        <button type="submit" className="login-button">
                            login
                        </button>
                        <Link id='resetPassword' to="/resetPasswordRequest">Forgot password? Create here a new one.</Link>
                    </form>
                )
            }
        </div>
    );
};

export default Login;
