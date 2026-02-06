import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

// GET single team member
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

        const user = await User.findById(id).select('-password');

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({ user }, { status: 200 });
    } catch (error) {
        console.error('Get team member error:', error);
        return NextResponse.json({ error: 'Failed to fetch team member' }, { status: 500 });
    }
}

// PUT update team member (admin only)
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

        if (session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Access denied' }, { status: 403 });
        }

        await connectDB();

        const body = await request.json();
        const { name, email, role, password } = body;

        const updateData: { name?: string; email?: string; role?: string; password?: string } = {};
        if (name) updateData.name = name;
        if (email) updateData.email = email;
        if (role && ['admin', 'team'].includes(role)) updateData.role = role;
        if (password) updateData.password = password;

        const user = await User.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true,
        }).select('-password');

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Team member updated', user }, { status: 200 });
    } catch (error) {
        console.error('Update team member error:', error);
        return NextResponse.json({ error: 'Failed to update team member' }, { status: 500 });
    }
}

// DELETE team member (admin only)
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

        // Prevent self-deletion
        if (session.user.id === id) {
            return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 });
        }

        await connectDB();

        const user = await User.findByIdAndDelete(id);

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Team member deleted' }, { status: 200 });
    } catch (error) {
        console.error('Delete team member error:', error);
        return NextResponse.json({ error: 'Failed to delete team member' }, { status: 500 });
    }
}
