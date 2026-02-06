import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Client from '@/models/Client';

// GET single client
export async function GET(
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

        const client = await Client.findById(id)
            .populate('assignedTo', 'name email')
            .populate('createdBy', 'name email')
            .populate('visitHistory.visitedBy', 'name email');

        if (!client) {
            return NextResponse.json({ error: 'Client not found' }, { status: 404 });
        }

        // Team members can only view their assigned clients
        if (session.user.role === 'team' && client.assignedTo._id.toString() !== session.user.id) {
            return NextResponse.json({ error: 'Access denied' }, { status: 403 });
        }

        return NextResponse.json({ client }, { status: 200 });
    } catch (error) {
        console.error('Get client error:', error);
        return NextResponse.json({ error: 'Failed to fetch client' }, { status: 500 });
    }
}

// PUT update client
export async function PUT(
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
            name,
            address,
            mapLocationLink,
            phone,
            assignedTo,
            assignedVisitDate,
            meetingStatus,
            clientStatus,
        } = body;

        // Update fields
        if (name) client.name = name;
        if (address) client.address = address;
        if (mapLocationLink !== undefined) client.mapLocationLink = mapLocationLink;
        if (phone) client.phone = phone;
        if (assignedTo && session.user.role === 'admin') client.assignedTo = assignedTo;
        if (assignedVisitDate) client.assignedVisitDate = new Date(assignedVisitDate);
        if (meetingStatus) client.meetingStatus = meetingStatus;
        if (clientStatus) client.clientStatus = clientStatus;

        await client.save();

        const updatedClient = await Client.findById(id)
            .populate('assignedTo', 'name email')
            .populate('createdBy', 'name email');

        return NextResponse.json({ message: 'Client updated', client: updatedClient }, { status: 200 });
    } catch (error) {
        console.error('Update client error:', error);
        return NextResponse.json({ error: 'Failed to update client' }, { status: 500 });
    }
}

// DELETE client (admin only)
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        const { id } = await params;

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        if (session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Access denied' }, { status: 403 });
        }

        await connectDB();

        const client = await Client.findByIdAndDelete(id);

        if (!client) {
            return NextResponse.json({ error: 'Client not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Client deleted' }, { status: 200 });
    } catch (error) {
        console.error('Delete client error:', error);
        return NextResponse.json({ error: 'Failed to delete client' }, { status: 500 });
    }
}
