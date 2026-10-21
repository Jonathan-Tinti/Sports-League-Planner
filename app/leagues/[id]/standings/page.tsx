
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

type Team = {
    id: string;
    name: string;
};

type Game = {
    id: string;
    home_team_id: string;
    away_team_id: string;
    home_score: number;
    away_score: number;
};

type Standing = {
    id: string;
    name: string;
    gp: number;
    wins: number;
    losses: number;
    ties: number;
    pointsFor: number;
    pointsAgainst: number;
    pointDiff: number;
    points: number;
};

const styles = {
    page: {
        minHeight: '100vh',
        backgroundColor: '#eef0f0',
        padding: '30px',
        color: '#333333',
    },
    container: {
        backgroundColor: '#eef0f0',
        display: 'flex', 
        flexDirection: 'row',
        height: '100vh',
        width: '100vw',
        justifyContent: 'center',
    },
    title: {
        fontSize: '28px',
        fontWeight: 'bold',
        position: 'relative',
        margin: '10px', 
        top: 0,
        textDecoration: 'underline'
    },
    description: {
        marginBottom: '24px',
        color: '#555555',
    },
    tableWrapper: {
        width: '90%',
        overflowX: 'auto' as const,
        backgroundColor: '#FFFFF0',
        borderRadius: '8px',
    },
    table: {
        width: '100%',
        minWidth: '750px',
        borderCollapse: 'collapse' as const,
    },
    tableHeader: {
        backgroundColor: '#3f414d',
        color: 'white',
        padding: '12px',
        textAlign: 'center' as const,
        border: '1px solid #d1d5db',
        whiteSpace: 'nowrap' as const,
    },
    tableCell: {
        padding: '12px',
        textAlign: 'center' as const,
        border: '1px solid #d1d5db',
    },
    teamCell: {
        padding: '12px',
        textAlign: 'left' as const,
        border: '1px solid #d1d5db',
        fontWeight: 600,
    },
    message: {
        padding: '20px',
        backgroundColor: '#FFFFF0',
        borderRadius: '8px',
    },
    loadingScreen: {
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFFFF0',
    },
    loadingBall: {
        fontSize: '70px',
        animation: 'spin 2s linear infinite',
    },
    loadingTitle: {
        fontSize: '32px',
        marginTop: '20px',
        marginBottom: '10px',
    },
    loadingText: {
        fontSize: '18px',
        color: '#555',
    },
    loadingBar: {
        width: '250px',
        height: '8px',
        backgroundColor: '#ddd',
        borderRadius: '10px',
        overflow: 'hidden',
        marginTop: '20px',
    },
    loadingProgress: {
        width: '40%',
        height: '100%',
        backgroundColor: '#4CAF50',
        borderRadius: '10px',
        animation: 'loading 1.5s ease-in-out infinite',
    },
    subContainer: {
        backgroundColor: '#FFFFF0', 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        width: '80%',
        height: 'auto', 
        borderRadius: '10px',
        margin: '60px', 
    }, 
    navContainer: {
        backgroundColor: '#3f414d', 
        display: 'flex',
        flexDirection: 'row', 
        alignItems: 'center',
        justifyContent: 'space-between', 
        width: '100%',
        height: '60px',
        borderBottom: '1px solid', 
        paddingLeft: '25px',
        paddingRight: '25px'
    },
    navSubContainer: {
        backgroundColor: '#3f414d', 
        display: 'flex',
        flexDirection: 'row', 
        alignItems: 'center',
        justifyContent: 'space-between', 
        width: '30%',
        height: '60px',
        flex: '1'
    },
    headerContainer: {
        display: 'flex',
        flexDirection: 'row', 
        alignItems: 'center',
        marginTop: '10px'
    },
    dummy: {
        flex: '1'
    }, 
    navbarText: {
        fontSize: '18px', 
        margin: 'auto', 
        color: 'white',
    }, 
    navButton: {
        backgroundColor: '#e1edf8',
        border: '1px solid', 
        borderColor: '#000000',
        padding: '5px 10px',
        cursor: 'pointer',
        top: '15px',
        right: '15px', 
        borderRadius: '5px',
    }, 
};

export default function StandingsPage() {
    const { id: leagueId } = useParams<{ id: string }>();
    const router = useRouter();
    const [standings, setStandings] = useState<Standing[]>([]);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        async function loadStandings() {
            setLoading(true);
            setErrorMessage('');

            const supabase = createClient();

            try {
                const { data: teamsData, error: teamsError } =
                    await supabase
                        .from('teams')
                        .select('id, name')
                        .eq('league_id', leagueId)
                        .order('name');

                if (teamsError) {
                    throw teamsError;
                }

                const { data: gamesData, error: gamesError } =
                    await supabase
                        .from('games')
                        .select(
                            'id, home_team_id, away_team_id, home_score, away_score'
                        )
                        .eq('league_id', leagueId)
                        .lt('game_date', new Date().toISOString().split('T')[0])
                        ;

                if (gamesError) {
                    throw gamesError;
                }

                const teams = (teamsData ?? []) as Team[];
                const games = (gamesData ?? []) as Game[];

                const table = new Map<string, Standing>();

                for (const team of teams) {
                    table.set(team.id, {
                        id: team.id,
                        name: team.name,
                        gp: 0,
                        wins: 0,
                        losses: 0,
                        ties: 0,
                        pointsFor: 0,
                        pointsAgainst: 0,
                        pointDiff: 0,
                        points: 0,
                    });
                }

                for (const game of games) {
                    const home = table.get(game.home_team_id);
                    const away = table.get(game.away_team_id);

                    if (!home || !away) {
                        continue;
                    }

                    const homeScore = Number(game.home_score);
                    const awayScore = Number(game.away_score);

                    home.gp++;
                    away.gp++;
                    home.pointsFor += homeScore;
                    home.pointsAgainst += awayScore;
                    away.pointsFor += awayScore;
                    away.pointsAgainst += homeScore;

                    if (homeScore > awayScore) {
                        home.wins++;
                        home.points += 3;
                        away.losses++;
                    } else if (awayScore > homeScore) {
                        away.wins++;
                        away.points += 3;
                        home.losses++;
                    } else {
                        home.ties++;
                        away.ties++;

                        home.points += 1;
                        away.points += 1;
                    }
                }

                const results = Array.from(table.values()).map(
                    (team) => ({
                        ...team,
                        pointDiff:
                            team.pointsFor - team.pointsAgainst,
                    })
                );

                results.sort((a, b) =>
                    b.points - a.points ||
                    b.pointDiff - a.pointDiff ||
                    b.pointsFor - a.pointsFor ||
                    a.name.localeCompare(b.name)
                );
                setStandings(results);
            } catch (error) {
                console.error('Error loading standings:', error);
                setErrorMessage(
                    'Could not load standings. Please try again.'
                );
            } finally {
                setLoading(false);
            }
        }

        if (leagueId) {
            loadStandings();
        }
    }, [leagueId]);

    if (loading) {
        return (
            <div style={styles.loadingScreen}>
                <style>
                    {`
                        @keyframes spin {
                            from {
                                transform: rotate(0deg);
                            }
                            to {
                                transform: rotate(360deg);
                            }
                        }

                        @keyframes loading {
                            0% {
                                transform: translateX(-250%);
                            }
                            100% {
                                transform: translateX(650%);
                            }
                        }
                    `}
                </style>

                <div style={styles.loadingBall}>⚽</div>

                <h1 style={styles.loadingTitle}>
                    Soccer League
                </h1>

                <p style={styles.loadingText}>
                    Preparing the pitch...
                </p>

                <div style={styles.loadingBar}>
                    <div style={styles.loadingProgress}></div>
                </div>
            </div>
        );
    }

    return (
        <div>
            <div style={styles.navContainer}>
                <div style={styles.dummy}>
                    <button onClick={() => router.push(`/leagues/${leagueId}`)} style={styles.navButton}>←</button>
                </div>
                <div style={styles.navSubContainer}>   
                    <button onClick={() => router.push(`/leagues/${leagueId}/teams`)} style={styles.navButton}>Teams</button>
                    <button onClick={() => router.push(`/leagues/${leagueId}/games`)} style={styles.navButton}>Games</button>
                </div>
                <div style={styles.dummy} aria-hidden="true"></div>
            </div>
            <div style={styles.container}>
                <div style={styles.subContainer}>
                    <h1 style={styles.title}>League Standings</h1>

                    <p style={styles.description}>
                        Standings are calculated from completed games.
                        Wins earn 3 points, ties earn 1 point, and
                        losses earn 0 points.
                    </p>

                    {loading ? (
                        <p style={styles.message}>
                            Loading standings...
                        </p>
                    ) : errorMessage ? (
                        <p style={styles.message}>{errorMessage}</p>
                    ) : standings.length === 0 ? (
                        <p style={styles.message}>
                            No teams have been added to this league yet.
                        </p>
                    ) : (
                        <div style={styles.tableWrapper}>
                            <table style={styles.table}>
                                <thead>
                                    <tr>
                                        <th style={styles.tableHeader}>
                                            #
                                        </th>
                                        <th
                                            style={{
                                                ...styles.tableHeader,
                                                textAlign: 'left',
                                            }}
                                        >
                                            Team
                                        </th>
                                        <th style={styles.tableHeader}>
                                            GP
                                        </th>
                                        <th style={styles.tableHeader}>
                                            W
                                        </th>
                                        <th style={styles.tableHeader}>
                                            L
                                        </th>
                                        <th style={styles.tableHeader}>
                                            T
                                        </th>
                                        <th style={styles.tableHeader}>
                                            PF
                                        </th>
                                        <th style={styles.tableHeader}>
                                            PA
                                        </th>
                                        <th style={styles.tableHeader}>
                                            Diff
                                        </th>
                                        <th style={styles.tableHeader}>
                                            Pts
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {standings.map((team, index) => (
                                        <tr key={team.id}>
                                            <td style={styles.tableCell}>
                                                {index + 1}
                                            </td>

                                            <td style={styles.teamCell}>
                                                {team.name}
                                            </td>

                                            <td style={styles.tableCell}>
                                                {team.gp}
                                            </td>

                                            <td style={styles.tableCell}>
                                                {team.wins}
                                            </td>

                                            <td style={styles.tableCell}>
                                                {team.losses}
                                            </td>

                                            <td style={styles.tableCell}>
                                                {team.ties}
                                            </td>

                                            <td style={styles.tableCell}>
                                                {team.pointsFor}
                                            </td>

                                            <td style={styles.tableCell}>
                                                {team.pointsAgainst}
                                            </td>

                                            <td style={styles.tableCell}>
                                                {team.pointDiff > 0
                                                    ? `+${team.pointDiff}`
                                                    : team.pointDiff}
                                            </td>

                                            <td
                                                style={{
                                                    ...styles.tableCell,
                                                    fontWeight: 700,
                                                }}
                                            >
                                                {team.points}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    <p style={{ marginTop: '16px', marginBottom: '10px', color: '#555555' }}>
                        GP = Games Played · PF = Points For · PA = Points
                        Against · Diff = Point Differential · Pts =
                        Standings Points
                    </p>
                </div>
            </div>
        </div>
    );
}

