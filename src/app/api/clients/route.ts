import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Client from '@/models/Client';

// GET all clients with filters
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        const { searchParams } = new URL(request.url);
        const date = searchParams.get('date');
        const status = searchParams.get('status');
        const clientStatus = searchParams.get('clientStatus');
        const assignedTo = searchParams.get('assignedTo');

        // Build query
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const query: any = {};

        // If team member, only show their assigned clients
        if (session.user.role === 'team') {
            query.assignedTo = session.user.id;
        } else if (assignedTo) {
            query.assignedTo = assignedTo;
        }

        // Date filter
        if (date) {
            const startOfDay = new Date(date);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(date);
            endOfDay.setHours(23, 59, 59, 999);
            query.assignedVisitDate = { $gte: startOfDay, $lte: endOfDay };
        }

        // Meeting status filter
        if (status && ['pending', 'visited', 'rescheduled'].includes(status)) {
            query.meetingStatus = status;
        }

        // Client status filter
        if (clientStatus && ['registered', 'not_registered'].includes(clientStatus)) {
            query.clientStatus = clientStatus;
        }

        const clients = await Client.find(query)
            .populate('assignedTo', 'name email')
            .populate('createdBy', 'name email')
            .sort({ assignedVisitDate: -1, createdAt: -1 });

        return NextResponse.json({ clients }, { status: 200 });
    } catch (error) {
        console.error('Get clients error:', error);
        return NextResponse.json({ error: 'Failed to fetch clients' }, { status: 500 });
    }
}

// POST create new client
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        const body = await request.json();
        const { name, address, mapLocationLink, phone, assignedTo, assignedVisitDate } = body;

        // Validate input
        if (!name || !address || !phone || !assignedTo || !assignedVisitDate) {
            return NextResponse.json(
                { error: 'Please provide all required fields' },
                { status: 400 }
            );
        }

        // Create new client
        const client = await Client.create({
            name,
            address,
            mapLocationLink,
            phone,
            assignedTo,
            assignedVisitDate: new Date(assignedVisitDate),
            meetingStatus: 'pending',
            clientStatus: 'not_registered',
            createdBy: session.user.id,
            visitHistory: [
                {
                    visitDate: new Date(assignedVisitDate),
                    visitedBy: assignedTo,
                    status: 'pending',
                    createdAt: new Date(),
                },
            ],
        });

        const populatedClient = await Client.findById(client._id)
            .populate('assignedTo', 'name email')
            .populate('createdBy', 'name email');

        return NextResponse.json(
            {
                message: 'Client created successfully',
                client: populatedClient,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('Create client error:', error);
        return NextResponse.json({ error: 'Failed to create client' }, { status: 500 });
    }
}
