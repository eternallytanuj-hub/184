import { NextRequest, NextResponse } from 'next/server';
import { execFile } from 'child_process';
import fs from 'fs';
import util from 'util';

const execFilePromise = util.promisify(execFile);

// Primary ADB binary paths in order of preference
const PRIMARY_ADB_PATH = '/Users/tanujpathak/Library/Android/sdk/platform-tools/adb';
const TARGET_DEVICE_ID = process.env.ADB_DEVICE_ID || 'ZD222K9HBL';

interface DetectedDevice {
  serial: string;
  state: string;
  model?: string;
  product?: string;
  device?: string;
  transportId?: string;
}

/**
 * Resolves the operational ADB executable path.
 */
function resolveAdbPath(): string {
  if (process.env.ADB_PATH) {
    if (process.env.ADB_PATH === 'adb' || fs.existsSync(process.env.ADB_PATH)) {
      return process.env.ADB_PATH;
    }
  }
  if (fs.existsSync(PRIMARY_ADB_PATH)) {
    return PRIMARY_ADB_PATH;
  }
  return 'adb';
}

/**
 * Parses `adb devices -l` output into structured device descriptors.
 */
function parseDevicesOutput(output: string): DetectedDevice[] {
  const lines = output.split('\n');
  const devices: DetectedDevice[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('List of devices attached') || trimmed.startsWith('* daemon')) {
      continue;
    }

    const parts = trimmed.split(/\s+/);
    if (parts.length >= 2) {
      const serial = parts[0];
      const state = parts[1];
      const rest = parts.slice(2).join(' ');

      const modelMatch = rest.match(/model:(\S+)/);
      const productMatch = rest.match(/product:(\S+)/);
      const deviceMatch = rest.match(/device:(\S+)/);
      const transportMatch = rest.match(/transport_id:(\S+)/);

      devices.push({
        serial,
        state,
        model: modelMatch ? modelMatch[1] : undefined,
        product: productMatch ? productMatch[1] : undefined,
        device: deviceMatch ? deviceMatch[1] : undefined,
        transportId: transportMatch ? transportMatch[1] : undefined,
      });
    }
  }

  return devices;
}

/**
 * Discovers attached ADB devices with timeout.
 */
async function getAttachedDevices(adbPath: string): Promise<DetectedDevice[]> {
  try {
    const { stdout } = await execFilePromise(adbPath, ['devices', '-l'], { timeout: 3500 });
    return parseDevicesOutput(stdout);
  } catch (err: any) {
    console.warn('[ADB Discovery Warning]:', err.message);
    return [];
  }
}

/**
 * Selects preferred target device (prioritizing ZD222K9HBL, then any connected online device).
 */
function selectTargetDevice(devices: DetectedDevice[]): DetectedDevice | null {
  const onlineDevices = devices.filter((d) => d.state === 'device');
  if (onlineDevices.length === 0) return null;

  const preferred = onlineDevices.find((d) => d.serial === TARGET_DEVICE_ID);
  if (preferred) return preferred;

  return onlineDevices[0];
}

/**
 * Sanitizes phone numbers to standard format (+ and digits).
 */
function sanitizePhone(rawPhone: unknown): string {
  if (typeof rawPhone !== 'string') return '+919829041209';
  const cleaned = rawPhone.replace(/[^\d+]/g, '').trim();
  if (cleaned.length < 5) return '+919829041209';

  // Ensure single leading + if international format
  if (cleaned.startsWith('+')) {
    return '+' + cleaned.slice(1).replace(/\+/g, '');
  }
  return cleaned;
}

/**
 * Sanitizes and normalizes the message body for ADB intent extras.
 */
function sanitizeMessage(rawMessage: unknown): string {
  if (typeof rawMessage !== 'string' || !rawMessage.trim()) {
    return '[CYBERCAST FLASH DIRECTIVE] URGENT LAW ENFORCEMENT INTERVENTION REQUIRED';
  }
  // Replace newlines and extra whitespaces with single space
  const singleLine = rawMessage.replace(/[\r\n\t]+/g, ' ').replace(/\s+/g, ' ').trim();
  // Limit to reasonable tactical directive length
  return singleLine.slice(0, 480);
}

/**
 * Escapes characters for Android remote shell inside double quotes.
 * In POSIX/Android sh inside double quotes, only \, ", $, and ` require escaping.
 */
function escapeForAndroidShell(text: string): string {
  return '"' + text.replace(/["\\`$]/g, '\\$&') + '"';
}

/**
 * GET: Queries device connectivity and hardware bridge status.
 */
export async function GET() {
  const adbPath = resolveAdbPath();
  const devices = await getAttachedDevices(adbPath);
  const activeDevice = selectTargetDevice(devices);
  const unauthorizedDevice = devices.find((d) => d.state === 'unauthorized');
  const offlineDevice = devices.find((d) => d.state === 'offline');

  const isConnected = !!activeDevice;
  const isUnauthorized = !isConnected && !!unauthorizedDevice;
  const isOffline = !isConnected && !isUnauthorized && !!offlineDevice;

  let warning: string | undefined;
  const deviceState = isConnected ? 'online' : isUnauthorized ? 'unauthorized' : isOffline ? 'offline' : 'disconnected';

  if (isUnauthorized) {
    warning = `USB hardware (${unauthorizedDevice?.serial || TARGET_DEVICE_ID}) detected but unauthorized. Unlock phone and tap "Allow USB debugging".`;
  } else if (isOffline) {
    warning = `USB hardware (${offlineDevice?.serial || TARGET_DEVICE_ID}) is offline. Please reconnect USB cable.`;
  } else if (!isConnected) {
    warning = `Physical Android hardware (${TARGET_DEVICE_ID}) not detected. Simulation mode active.`;
  }

  const reportedDevice = activeDevice || unauthorizedDevice || offlineDevice;

  return NextResponse.json({
    connected: isConnected,
    mode: isConnected ? 'hardware' : 'simulation',
    unauthorized: isUnauthorized,
    deviceState,
    deviceId: reportedDevice ? reportedDevice.serial : null,
    model: reportedDevice ? reportedDevice.model || 'Android Device' : null,
    adbPath,
    targetConfigured: TARGET_DEVICE_ID,
    warning,
    devices,
    timestamp: new Date().toISOString(),
  });
}

/**
 * POST: Dispatches SMS SENDTO Intent to physical Android device via ADB,
 * falling back gracefully to simulation mode if hardware is unavailable or fails.
 */
export async function POST(req: NextRequest) {
  const now = new Date();
  const dltReference = `DLT-1407-${Math.floor(100000 + Math.random() * 900000)}`;

  let body: Record<string, any> = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  const phone = sanitizePhone(body.phone);
  const message = sanitizeMessage(body.message);
  const priority = body.priority || 'FLASH_P1';
  const officerName = body.officerName || 'Assigned Officer';
  const caseId = body.caseId || 'UNKNOWN';

  const adbPath = resolveAdbPath();
  const devices = await getAttachedDevices(adbPath);
  const activeDevice = selectTargetDevice(devices);

  // If no hardware device is connected or authorized, execute seamless simulation fallback
  if (!activeDevice) {
    const unauthorizedDevice = devices.find((d) => d.state === 'unauthorized');
    const warning = unauthorizedDevice
      ? `Physical Android device (${unauthorizedDevice.serial}) detected but unauthorized. Unlock phone and tap "Allow USB debugging". Simulation fallback executed.`
      : 'Physical Android device not detected via ADB. Simulation fallback executed.';
    console.info(`[ADB-SMS Simulation]: ${warning}. Alert to ${phone}`);
    return NextResponse.json({
      success: true,
      mode: 'simulation',
      status: unauthorizedDevice ? 'UNAUTHORIZED_FALLBACK' : 'SIMULATED_FALLBACK',
      hardwareDispatched: false,
      unauthorized: !!unauthorizedDevice,
      deviceId: unauthorizedDevice ? unauthorizedDevice.serial : null,
      model: unauthorizedDevice ? unauthorizedDevice.model || 'Android Device' : null,
      phone,
      message,
      priority,
      officerName,
      caseId,
      timestamp: now.toISOString(),
      dltReference,
      warning,
    });
  }

  try {
    // 1. Wake screen up and dismiss keyguard on physical device
    try {
      await execFilePromise(adbPath, ['-s', activeDevice.serial, 'shell', 'input', 'keyevent', 'KEYCODE_WAKEUP'], {
        timeout: 2500,
      });
      await execFilePromise(adbPath, ['-s', activeDevice.serial, 'shell', 'wm', 'dismiss-keyguard'], {
        timeout: 2500,
      });
    } catch {
      // Screen wakeup non-fatal
    }

    // 2. Launch SMS SENDTO Intent on physical device
    const escapedBody = escapeForAndroidShell(message);
    const adbArgs = [
      '-s',
      activeDevice.serial,
      'shell',
      'am',
      'start',
      '-a',
      'android.intent.action.SENDTO',
      '-d',
      `sms:${phone}`,
      '--es',
      'sms_body',
      escapedBody,
      '--ez',
      'exit_on_sent',
      'true',
    ];

    const { stdout, stderr } = await execFilePromise(adbPath, adbArgs, { timeout: 6000 });

    if (stdout.includes('Error:') || (stderr && stderr.includes('Error:'))) {
      throw new Error(stdout || stderr || 'Android intent execution returned error');
    }

    return NextResponse.json({
      success: true,
      mode: 'hardware',
      status: 'DELIVERED_TO_HARDWARE',
      hardwareDispatched: true,
      deviceId: activeDevice.serial,
      model: activeDevice.model || 'Android Device',
      phone,
      message,
      priority,
      officerName,
      caseId,
      timestamp: now.toISOString(),
      dltReference,
      stdout: stdout.trim(),
      stderr: stderr ? stderr.trim() : undefined,
    });
  } catch (err: any) {
    console.warn('[ADB Intent Execution Failed - Fallback to Simulation]:', err.message);

    return NextResponse.json({
      success: true,
      mode: 'simulation',
      status: 'FALLBACK_SIMULATION',
      hardwareDispatched: false,
      deviceId: activeDevice.serial,
      model: activeDevice.model || 'Android Device',
      phone,
      message,
      priority,
      officerName,
      caseId,
      timestamp: now.toISOString(),
      dltReference,
      warning: `ADB hardware execution error: ${err.message}. Seamlessly fell back to simulation mode.`,
    });
  }
}
