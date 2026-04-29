import { google } from 'googleapis';
import { getAuthenticatedClient } from './google-auth';

/**
 * Uses Google Drive API to list spreadsheets the connected user has access to.
 */
export async function listSpreadsheets() {
  try {
    const auth = await getAuthenticatedClient();
    const drive = google.drive({ version: 'v3', auth });
    
    // Find files that are Google Sheets
    const response = await drive.files.list({
      q: "mimeType='application/vnd.google-apps.spreadsheet'",
      fields: 'files(id, name)',
      orderBy: 'modifiedTime desc',
      pageSize: 50, // Limit to recent 50
    });

    return response.data.files || [];
  } catch (error) {
    console.error('Error listing sheets:', error);
    throw error;
  }
}

/**
 * Gets the tabs (sheet names) inside a specific Google Spreadsheet.
 */
export async function getSpreadsheetTabs(fileId: string) {
  try {
    const auth = await getAuthenticatedClient();
    const sheets = google.sheets({ version: 'v4', auth });

    const response = await sheets.spreadsheets.get({
      spreadsheetId: fileId,
    });

    // Return an array of string tab titles
    return response.data.sheets
      ?.map(sheet => sheet.properties?.title)
      .filter((title): title is string => !!title) || [];
  } catch (error) {
    console.error('Error getting sheet tabs:', error);
    throw error;
  }
}

/**
 * Gets the raw 2D array of values from a specific sheet.
 */
export async function getSheetValues(fileId: string, range: string) {
  try {
    const auth = await getAuthenticatedClient();
    const sheets = google.sheets({ version: 'v4', auth });

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: fileId,
      range,
    });

    return response.data.values || [];
  } catch (error) {
    console.error('Error fetching data from Google Sheets:', error);
    throw error;
  }
}
