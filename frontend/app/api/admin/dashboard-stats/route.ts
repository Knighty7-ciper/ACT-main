import { NextRequest, NextResponse } from 'next/server';

/**
 * Admin Dashboard Statistics API
 * Returns real-time metrics for the admin dashboard
 * Requires admin authentication
 */

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

export async function GET(request: NextRequest) {
  try {
    // Get authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authorization header required' },
        { status: 401 }
      );
    }

    // Proxy request to backend
    const response = await fetch(`${BACKEND_URL}/admin/dashboard/stats`, {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.message || 'Failed to fetch dashboard statistics' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Dashboard stats proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to proxy request to backend' },
      { status: 500 }
    );
  }
}

    // Fetch real-time dashboard statistics
    const dashboardStats = await getDashboardStatistics(supabase);
    const systemMetrics = await getSystemMetrics();
    const recentAlerts = await getRecentAlerts(supabase);
    const quickActions = getQuickActions();

    const response = {
      success: true,
      data: {
        stats: dashboardStats,
        systemMetrics,
        alerts: recentAlerts,
        quickActions,
        timestamp: new Date().toISOString(),
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard statistics' },
      { status: 500 }
    );
  }
}