import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Client from '@/models/Client';

// GET dashboard statistics
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        const { searchParams } = new URL(request.url);
        const date = searchParams.get('date');

        // Build base query
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const baseQuery: any = {};

        // If team member, only show their stats
        if (session.user.role === 'team') {
            baseQuery.assignedTo = session.user.id;
        }

        // Date filter for today's stats
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let dateQuery: any = {};
        if (date) {
            const startOfDay = new Date(date);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(date);
            endOfDay.setHours(23, 59, 59, 999);
            dateQuery = { assignedVisitDate: { $gte: startOfDay, $lte: endOfDay } };
        }

        // Total clients (all time)
        const totalClients = await Client.countDocuments(baseQuery);

        // Registered clients
        const registeredClients = await Client.countDocuments({
            ...baseQuery,
            clientStatus: 'registered',
        });

        // Non-registered clients
        const nonRegisteredClients = await Client.countDocuments({
            ...baseQuery,
            clientStatus: 'not_registered',
        });

        // Date-filtered stats
        const dateFilteredQuery = { ...baseQuery, ...dateQuery };

        // Pending visits
        const pendingVisits = await Client.countDocuments({
            ...dateFilteredQuery,
            meetingStatus: 'pending',
        });

        // Visited
        const visitedCount = await Client.countDocuments({
            ...dateFilteredQuery,
            meetingStatus: 'visited',
        });

        // Rescheduled
        const rescheduledCount = await Client.countDocuments({
            ...dateFilteredQuery,
            meetingStatus: 'rescheduled',
        });

        // Today's clients count
        const todaysClients = await Client.countDocuments(dateFilteredQuery);

        return NextResponse.json({
            stats: {
                totalClients,
                registeredClients,
                nonRegisteredClients,
                todaysClients,
                pendingVisits,
                visitedCount,
                rescheduledCount,
            },
        }, { status: 200 });
    } catch (error) {
        console.error('Get stats error:', error);
        return NextResponse.json({ error: 'Failed to fetch statistics' }, { status: 500 });
    }
}
