'use client';

import React, { useState } from 'react';

type AddTeamFormProps = {
    onAddTeam: (teamName: string) => Promise<void>;
    onCancel: () => void;
};

export default function AddTeamForm({
    onAddTeam,
    onCancel
}: AddTeamFormProps) {

    const [teamName, setTeamName] = useState('');

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        if (!teamName.trim()) {
            return;
        }

        await onAddTeam(teamName);

        setTeamName('');
    }

    return (
        <div style={styles.overlay}>
            <form
                style={styles.form}
                onSubmit={handleSubmit}
            >
                <h1 style={styles.title}>
                    Create Team
                </h1>

                <input
                    type="text"
                    placeholder="Team name"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    style={styles.input}
                />

                <div>
                    <button
                        type="submit"
                        style={styles.button}
                    >
                        Create
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