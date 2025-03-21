import React, { useState, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage, FieldArray } from 'formik';
import * as Yup from 'yup';
import { User } from '../../api/fetchUsers';
import { tenantId } from '../../globals';
import './UserForm.css';
import { fetchRoles } from '../../api/fetchRoles';

interface UserFormProps {
    user?: User;
    onSave: (values: User) => void;
    onCancel: () => void;
    title?: string;
}

const UserForm: React.FC<UserFormProps> = ({ user, onSave, onCancel, title = "Форма пользователя"  }) => {
    const [availableRoles, setAvailableRoles] = useState<string[]>([]);

    useEffect(() => {
        const loadRoles = async () => {
            try {
                const roles = await fetchRoles();
                setAvailableRoles(roles);
            } catch (err) {
                console.error("Error fetching roles:", err);
            }
        };

        loadRoles();
    }, []);

    const initialValues: User = user || {
        username: '',
        email: '',
        authorization: { [tenantId]: { roles: [] } },
        userId: 0,
    };

    const validationSchema = Yup.object({
        username: Yup.string().required('Обязательно'),
        email: Yup.string().email('Некорректный email').required('Обязательно'),
        password: user
            ? Yup.string().min(6, 'Пароль должен быть не менее 6 символов').optional()
            : Yup.string().min(6, 'Пароль должен быть не менее 6 символов').required('Обязательно'),
        userId: Yup.number().required('Обязательно'),
    });

    // const handleSubmit = (values: User) => {
    //     onFormChange(values);
    // };

    // useEffect(() => {
    //     onFormChange(initialValues);
    // }, []);

    const inputStyle = {
        width: '200px',
        padding: '8px',
        margin: '4px 0',
        boxSizing: 'border-box',
        border: '1px solid #ccc',
        borderRadius: '4px',
    };

    const labelStyle = {
        display: 'inline-block',
        width: '120px',
        marginRight: '10px',
        textAlign: 'right' as React.CSSProperties['textAlign'],
    };

    return (
        <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={(values) => onSave(values)}>
            {({ values }) => (
                <Form>
                    <h3>{title}</h3> 
                    <div>
                        <label htmlFor="userId" style={labelStyle}>ID пользователя:</label>
                        <Field id="userId" name="userId" type="number" placeholder="ID пользователя" style={inputStyle} />
                        <ErrorMessage name="userId" component="div" className="error-message" />
                    </div>

                    <div>
                        <label htmlFor="username" style={labelStyle}>Имя пользователя:</label>
                        <Field id="username" name="username" placeholder="Имя пользователя" style={inputStyle} />
                        <ErrorMessage name="username" component="div" className="error-message" />
                    </div>

                    <div>
                        <label htmlFor="email" style={labelStyle}>Email:</label>
                        <Field id="email" name="email" type="email" placeholder="Email" style={inputStyle} />
                        <ErrorMessage name="email" component="div" className="error-message" />
                    </div>

                    <div>
                        <label htmlFor="password" style={labelStyle}>Пароль:</label>
                        <Field id="password" name="password" type="password" placeholder="Пароль" style={inputStyle} />
                        <ErrorMessage name="password" component="div" className="error-message" />
                    </div>

                    <div>
                        <label style={labelStyle}>Роли:</label>
                        <div style={{ marginLeft: '130px'}}>
                        <FieldArray name={`authorization.${tenantId}.roles`}>
                            {({ push, remove, form }) => (
                                <div>
                                    {availableRoles.map((role) => (
                                        <div key={role}>
                                            <label>
                                                <input
                                                    type="checkbox"
                                                    checked={values.authorization?.[tenantId]?.roles?.includes(role)}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            push(role);
                                                        } else {
                                                            const index = values.authorization?.[tenantId]?.roles?.indexOf(role);
                                                            if (index !== -1) {
                                                                remove(index);
                                                            }
                                                        }
                                                    }}
                                                />
                                                {role}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </FieldArray>
                    </div>
                    </div>
                    <div className="modal-buttons">
                        <button type="button" className="modal-button" onClick={onCancel}>Отмена</button>
                        <button type="submit" className="modal-button">Записать</button>
                    </div>
                </Form>
            )}
        </Formik>
    );
};

export default UserForm;