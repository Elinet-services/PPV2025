const C_FOLDERID_DOCUMENTS = '1pbW9dUJqtmFCy8S20eGJ1u2hFUGqkGm4';
const sheetDocuments    = SpreadsheetApp.openById('1rVjHI3awn-lpRVqUXl5gSAjYOG0H2zJMRE8zrjd7SZ0').getSheetByName('Documents');

//  ---------------
function doGet() {
  return HtmlService.createHtmlOutputFromFile('documents_index');
}


// Vrátí pole záznamů včetně row indexu (pro editaci)
function getRecords() {
  log('getRecords---')
  const result = [];
  try {
    const rows = sheetDocuments.getDataRange().getValues();
    for (let i = 1; i < rows.length; i++) { // preskoc hlavicku
      const r = rows[i];
      result.push({
        row: i + 1, // skutečné číslo řádku v sheet (1-based)
        fileId: r[1] || '',
        filename: r[2] || '',
        docName: r[3] || '',
        dateInserted: r[4] || '',
        description: r[5] || '',
        published: !!r[6]
      });
    }
    log(result)
  } catch (e) {
    log('getRecords error: ' + e.toString());
  }
  return JSON.stringify(result || []);
}

function createFile(blob)
{
  try {
    const folder = DriveApp.getFolderById(C_FOLDERID_DOCUMENTS);
    const newFile = folder.createFile(blob);
    newFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    return newFile.getId();
  } catch (e) {
    Logger.log('Drive createFile error: ' + e.toString());
    throw new Error('Chyba při ukládání souboru do Drive: ' + e.message);
  }
}

// Uloží nový soubor nebo aktualizuje existující (přepis obsahu pokud je fileBase64 přítomen)
function saveRecord(payload) {
  log('SaveRecord--');
  log(payload.fileId);
  log(payload.mimeType)
  // payload: { row (optional), fileBase64 (opt), filename, mimeType, docName, description, published }
  const now = new Date();
  let fileId = payload.fileId || '';

  // pokud při editaci došlo k dodání souboru -> pokud existuje fileId, přepiš; jinak vytvoř nový
  if (payload.fileBase64 && payload.filename) {
    const bytes = Utilities.base64Decode(payload.fileBase64);
    const blob = Utilities.newBlob(bytes, payload.mimeType || 'application/octet-stream', payload.filename);
    if (fileId) {
      try {
        const file = DriveApp.getFileById(fileId);
        // přepiš obsah a jméno
        file.setContent(blob.getBytes());
        file.setName(payload.filename);
      } catch (e) {
        // pokud fileId neplatí, vytvoř nový
        fileId = createFile(blob);
      }
    } else {
      fileId = createFile(blob);
    }
  }

  // připrav hodnoty pro uložení do sheet
  const rowValues = [
    '', // placeholder row kolona (naplníme později)
    fileId,
    payload.filename || '',
    payload.docName || '',
    Utilities.formatDate(now, Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss'),
    payload.description || '',
    payload.published ? 'TRUE' : ''
  ];

  if (payload.row) {
    // aktualizace existujícího řádku
    const row = payload.row;
    sheetDocuments.getRange(row, 2, 1, rowValues.length).setValues([rowValues.slice(1)]); // sloupce od fileId (col 2)
    return { ok: true, row: row, fileId: fileId, downloadUrl: fileId ? `https://drive.google.com/uc?export=download&id=${fileId}` : '' };
  } else {
    // novy radek
    const appendRow = [ (sheetDocuments.getLastRow()+1).toString() ].concat(rowValues.slice(1)); // volitelne ukladame cislo radku jako sloupec 1
    sheetDocuments.appendRow(appendRow);
    const newRowNumber = sheetDocuments.getLastRow();
    // nastaveme prvni sloupec 'row' na cislo radku
    sheetDocuments.getRange(newRowNumber, 1).setValue(newRowNumber);
    return { ok: true, row: newRowNumber, fileId: fileId, downloadUrl: fileId ? `https://drive.google.com/uc?export=download&id=${fileId}` : '' };
  }
}

// Aktualizuje jen metadata (bez uploadu souboru)
function updateRecordMetadata(payload) {
  // payload: { row, docName, description, published }
  const row = payload.row;
  if (!row) return { ok:false, error: 'Chybí row' };
  sheetDocuments.getRange(row, 4).setValue(payload.docName || ''); // docName col 4
  sheetDocuments.getRange(row, 6).setValue(payload.description || ''); // description col 6
  sheetDocuments.getRange(row, 7).setValue(payload.published ? 'TRUE' : '');
  return { ok: true };
}

// Vrací podrobnosti jednoho záznamu
function getRecord(row) {
  log('getRecord--')
  log (row);
  const r = sheetDocuments.getRange(row, 1, 1, sheetDocuments.getLastColumn()).getValues()[0];
  return JSON.stringify(
    {
      row: row,
      fileId: r[1] || '',
      filename: r[2] || '',
      docName: r[3] || '',
      dateInserted: r[4] || '',
      description: r[5] || '',
      published: !!r[6]
    }
  );
}

//  -----------------------------
function log (a_val)
{
    Logger.log(a_val);
}