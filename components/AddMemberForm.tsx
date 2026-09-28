'use client';

import React, { useState } from 'react';

type Member = {
    user_id: string;
    role: string;
    users: {
        name: string;
        email: string;
    };
}; 

type AddMemberFormProps = {
    members: Member[]; 
    onAddMember: (
        role: string,
        email: string, 
    ) => Promise<void>;
    onCancel: () => void;
};

export default function AddMemberForm({
    members,
    onAddMember,
    onCancel
}: AddMemberFormProps) {

    const [role, setRole] = useState('');
    const [email, setEmail] = useState(''); 

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        if (!role) {
            return;
        }

        await onAddMember(
            role,
            email
        );

        setRole('');
    }

    return (
        <div style={styles.overlay}>
            <form
                style={styles.form}
                onSubmit={handleSubmit}
            >
                <h1 style={styles.title}>
                    Add Member
                </h1>

                <label>Email</label>

                <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="member@example.com"
                    style={styles.input}
                    />

                <label htmlFor="role">Role </label>
                    <select id="role" value={role} onChange={(e) => setRole(e.target.value)} style={styles.input}>
                    <option value="player">Player</option>
                    <option value="ref">Referee</option>
                    <option value="coach">Coach</option>
                    <option value="admin">Admin</option>
                    </select>
                <div>
                    <button
                        type="submit"
                        style={styles.button}
                    >
                        Add
                    </button>

                    <button
                        type="button"
                        onClick={onCancel}
                        style={styles.button}
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}

const styles = {
    overlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
    },
    form: {
        backgroundColor: '#FFFFF0',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '400px',
        padding: '30px',
        borderRadius: '10px',
        border: '1px solid',
    },
    title: {
        fontSize: '28px',
        fontWeight: 'bold',
        position: 'relative',
        marginTop: '10px', 
        top: 0
    },

    input: {
        backgroundColor: '#fdfefe', 
        border: '1px solid', 
        borderColor: '#000000', 
        padding: '10px', 
        margin: '10px 20px', 
        borderRadius: '5px',
    }, 
    button: {
        backgroundColor: '#e1edf8',
        border: '1px solid', 
        borderColor: '#000000',
        padding: '10px 20px',
        cursor: 'pointer',
        margin: '5px', 
        marginBottom: '15px',
        borderRadius: '5px',
    },
};