import './Invite.css';
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import user from '../../services/user';
import Error from '../../components/Error/Error';
import serviceHelper from '../../services/serviceHelper';
import { ToastType } from '../../interfaces/ToastType';
import toast from '../../services/toast';
import Loader from '../../components/Loader/Loader';
import Button from '../../components/Button/Button';

const Invite = () => {
    const navigate = useNavigate();
    const params = useParams();
    const { token } = params;
    const [authenticated, setAuthenticated] = useState<Boolean | null>(null);
    const [loading, setLoading] = useState(false);

    if(token === null) {
        navigate('/login');
    }

    const [inputValues, setInputValues] = useState({
        password: '',
        passwordRepeat: '',
    });

    const [errors, setErrors] = useState({
        password: {
            text: '',
            valid: false,
        },
        passwordRepeat: {
            text: '',
            valid: false,
        },
    });
    const [valid, setValid] = useState(false);

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
                setAuthenticated(false);
            }
        };
        checkLogin();
    }, []);

    const validateInputValues = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newError = { ...errors };

        if (e.target.name === 'password') {
            if (e.target.value.length < 8) {
                newError.password.text =
                    'Password must be at least 8 characters long';
                newError.password.valid = false;
            } else {
                newError.password.text = '';
                newError.password.valid = true;
            }
        }

        if (e.target.name === 'passwordRepeat') {
            if (e.target.value !== inputValues.password) {
                newError.passwordRepeat.text = 'Passwords do not match';
                newError.passwordRepeat.valid = false;
            } else {
                newError.passwordRepeat.text = '';
                newError.passwordRepeat.valid = true;
            }
        }

        setErrors(newError);

        if (newError.password.valid && newError.passwordRepeat.valid) {
            setValid(true);
        } else {
            setValid(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        validateInputValues(e);

        setInputValues({
            ...inputValues,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        if (valid) {
            try {
                const res = await user.register(token!, inputValues.passwordRepeat);

                if(res.ok) {
                    toast.showToast(ToastType.SUCCESS, 'password set');
                    setTimeout(async () => {
                        setLoading(false);
                        navigate('/commit');
                    }, 2000);
                }
                else {
                    toast.showToast(ToastType.ERROR, toast.httpError(res.status, 'Token invalid or expired.'));
                    setLoading(false);
                }
            }
            catch(err) {
                toast.showToast(ToastType.ERROR, 'Connection error. Try again later.');
                setLoading(false);
            }
        }
    };

    return (
        <div className="center">
            {
                authenticated === null ? (
                    <Loader height={32} width={32} borderWidth={5}/>
                ) : (
                    <form className="register-form" onSubmit={handleSubmit}>
                        <div className="input-wrapper">
                            <div className="input-with-label">
                                <label htmlFor="password">password:</label>
                                <input
                                    type="password"
                                    name="password"
                                    value={inputValues.password}
                                    onChange={handleChange}
                                />
                            </div>
                            <Error text={errors.password.text} />
                        </div>
                        <div className="input-wrapper">
                            <div className="input-with-label">
                                <label htmlFor="password-repeat">
                                    password repeat:
                                </label>
                                <input
                                    type="password"
                                    name="passwordRepeat"
                                    value={inputValues.passwordRepeat}
                                    onChange={handleChange}
                                />
                            </div>
                            <Error text={errors.passwordRepeat.text} />
                        </div>
                        <div className="invite-button">
                            <Button text={"set password"} loading={loading} disabled={!valid}/>
                        </div>
                    </form>
                )
            }
        </div>
    );
};

export default Invite;
