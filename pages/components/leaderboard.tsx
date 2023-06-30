import React from 'react';
import classNames from 'classnames';

interface LeaderboardData {
    player: string;
    army: number;
    land: number;
}

interface Props {
    leaderboardData: LeaderboardData[];
    turn: number;
}

const Leaderboard = ({ leaderboardData, turn }: Props) => {
    return (
        <>
            <div className="bg-gray-800 text-white py-4">
                <a className="text-2xl font-bold" id="turner">
                    Turn {turn}
                </a>
            </div>
            <div className="bg-gray-100 py-4">
                <table className="table-auto mx-auto">
                    <thead>
                        <tr>
                            <th className="px-4 py-2">Player</th>
                            <th className="px-4 py-2">Army</th>
                            <th className="px-4 py-2">Land</th>
                        </tr>
                    </thead>
                    <tbody>
                        {leaderboardData.map((data: LeaderboardData, index: number) => (
                            <tr
                                key={index}
                                className={classNames({ 'bg-gray-200': index % 2 === 0 })}
                            >
                                <td className="border px-4 py-2">{data.player}</td>
                                <td className="border px-4 py-2">{data.army}</td>
                                <td className="border px-4 py-2">{data.land}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
};

export default Leaderboard;
