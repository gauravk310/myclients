import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Client from '@/models/Client';

// POST add visit history entry
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        const { id } = await params;

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        const client = await Client.findById(id);

        if (!client) {
            return NextResponse.json({ error: 'Client not found' }, { status: 404 });
        }

        // Team members can only update their assigned clients
        if (session.user.role === 'team' && client.assignedTo.toString() !== session.user.id) {
            return NextResponse.json({ error: 'Access denied' }, { status: 403 });
        }

        const body = await request.json();
        const {
            status,
            feedback,
            issues,
            rescheduledDate,
            siteImages,
            contactPersonsCollected,
            registrationCompleted,
            registrationDetails,
            paymentScreenshots,
            documentImages,
        } = body;

        // Create visit history entry
        const visitEntry = {
            visitDate: new Date(),
            visitedBy: session.user.id,
            status: status || 'visited',
            feedback,
            issues,
            rescheduledDate: rescheduledDate ? new Date(rescheduledDate) : undefined,
            siteImages: siteImages || [],
            contactPersonsCollected: contactPersonsCollected || [],
            registrationCompleted: registrationCompleted || false,
            registrationDetails,
            paymentScreenshots: paymentScreenshots || [],
            documentImages: documentImages || [],
            createdAt: new Date(),
        };

        client.visitHistory.push(visitEntry);

        // Update main client status
        if (status) {
            client.meetingStatus = status;
        }

        if (rescheduledDate) {
            client.assignedVisitDate = new Date(rescheduledDate);
        }

        if (registrationCompleted) {
            client.clientStatus = 'registered';
        }

        await client.save();

        const updatedClient = await Client.findById(id)
            .populate('assignedTo', 'name email')
            .populate('createdBy', 'name email')
            .populate('visitHistory.visitedBy', 'name email');

        return NextResponse.json(
            { message: 'Visit recorded', client: updatedClient },
            { status: 201 }
        );
    } catch (error) {
        console.error('Add visit error:', error);
        return NextResponse.json({ error: 'Failed to record visit' }, { status: 500 });
    }
}
