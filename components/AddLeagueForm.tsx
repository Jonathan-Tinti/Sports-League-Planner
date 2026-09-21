'use client';

import React, { useState } from 'react';

type Team = {
    id: string;
    name: string;
};

type AddLeagueFormProps = {
    teams: Team[]; 
    onAddGame: (
        homeId: string,
        awayId: string,
        date: Date,
        location: string
    ) => Promise<void>;
    onCancel: () => void;
};

export default function AddLeaugueForm({
    teams,
    onAddGame,
    onCancel
}: AddLeagueFormProps) {

    const [homeId, setHomeId] = useState('');
    const [awayId, setAwayId] = useState('');
    const [date, setDate] = useState<Date | null>(new Date());
    const [location, setLocation] = useState('');

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        if (!homeId || !awayId || !date || !location.trim()) {
            return;
        }

        if (homeId === awayId) {
            return;
        }

        await onAddGame(
            homeId,
            awayId,
            date,
            location
        );

        setHomeId('');
        setAwayId('');
        setLocation('');
        setDate(new Date());
    }

    return (
        <div style={styles.overlay}>
            <form
                style={styles.form}
                onSubmit={handleSubmit}
            >
                <h1 style={styles.title}>
                    Create Game
                </h1>

                <label>Home Team</label>

                <select
                    value={homeId}
                    onChange={(e) => setHomeId(e.target.value)}
                    style={styles.input}
                >
                    <option value="">
                        Select Home Team
                    </option>

                    {teams.map((team) => (
                        <option key={team.id} value={team.id}>
                            {team.name}
                        </option>
                    ))}
                </select>

                <label>Away Team</label>

                <select
                    value={awayId}
                    onChange={(e) => setAwayId(e.target.value)}
                    style={styles.input}
                >
                    <option value="">
                        Select Away Team
                    </option>

                    {teams.map((team) => (
                        <option key={team.id} value={team.id}>
                            {team.name}
                        </option>
                    ))}
                </select>
                <input
                    type="text"
                    placeholder="Location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    style={styles.input}
                />
                <label>Choose Date:</label>
                <DatePicker 
                    selected={date} 
                    onChange={(date) => setDate(date)} 
                    dateFormat="yyyy-MM-dd"
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