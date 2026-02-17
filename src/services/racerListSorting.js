const ORDER_FIELD_CANDIDATES = [
  "order",
  "sortOrder",
  "entryOrder",
  "registrationOrder",
  "position",
  "poradi",
  "rowNr",
  "number",
];

function formatDateToIso(dateValue) {
  if (!(dateValue instanceof Date) || Number.isNaN(dateValue.getTime())) return "";
  const yyyy = String(dateValue.getFullYear());
  const mm = String(dateValue.getMonth() + 1).padStart(2, "0");
  const dd = String(dateValue.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function dateFromNumericValue(value) {
  if (!Number.isFinite(value)) return "";

  if (value >= 1e12) {
    return formatDateToIso(new Date(value));
  }

  if (value >= 1e9) {
    return formatDateToIso(new Date(value * 1000));
  }

  // Google Sheets / Excel serial date number
  if (value >= 20000 && value <= 80000) {
    const excelEpochMs = Date.UTC(1899, 11, 30);
    return formatDateToIso(new Date(excelEpochMs + value * 24 * 60 * 60 * 1000));
  }

  return "";
}

function parseSortNumber(value) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value !== "string") return null;

  const normalized = value
    .trim()
    .replace(/\u00A0/g, "")
    .replace(/\s+/g, "");

  if (!normalized) return null;

  if (/^-?\d+(?:[.,]\d+)?$/.test(normalized)) {
    const numeric = Number(normalized.replace(",", "."));
    return Number.isFinite(numeric) ? numeric : null;
  }

  const match = normalized.match(/-?\d+/);
  if (!match) return null;

  const numeric = Number(match[0]);
  return Number.isFinite(numeric) ? numeric : null;
}

function parseParameters(parameters) {
  if (!parameters) return null;
  if (typeof parameters === "object") return parameters;

  if (typeof parameters === "string") {
    const trimmed = parameters.trim();
    if (!trimmed) return null;
    try {
      const parsed = JSON.parse(trimmed);
      return parsed && typeof parsed === "object" ? parsed : null;
    } catch {
      return null;
    }
  }

  return null;
}

function getOrderCandidateValue(source) {
  if (!source || typeof source !== "object") return null;

  for (const fieldName of ORDER_FIELD_CANDIDATES) {
    if (Object.prototype.hasOwnProperty.call(source, fieldName)) {
      const candidate = source[fieldName];
      if (candidate !== null && candidate !== undefined && candidate !== "") {
        return candidate;
      }
    }
  }

  return null;
}

export function toSortableIsoDate(value) {
  if (value === null || value === undefined || value === "") return "";

  if (value instanceof Date) {
    return formatDateToIso(value);
  }

  if (typeof value === "number") {
    return dateFromNumericValue(value);
  }

  const str = String(value).trim();
  if (!str) return "";

  const numericDate = parseSortNumber(str);
  if (numericDate !== null) {
    const fromNumber = dateFromNumericValue(numericDate);
    if (fromNumber) return fromNumber;
  }

  const isoMatch = str.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) return `${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}`;

  const czMatch = str.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})(?:\s|$)/);
  if (czMatch) {
    const dd = czMatch[1].padStart(2, "0");
    const mm = czMatch[2].padStart(2, "0");
    const yyyy = czMatch[3];
    return `${yyyy}-${mm}-${dd}`;
  }

  const parsedDate = new Date(str);
  return formatDateToIso(parsedDate);
}

export function resolveRacerOrder(racer, fallbackOrder) {
  const directCandidate = getOrderCandidateValue(racer);
  const directOrder = parseSortNumber(directCandidate);
  if (directOrder !== null) return directOrder;

  const parsedParameters = parseParameters(racer?.parameters);
  const parameterCandidate = getOrderCandidateValue(parsedParameters);
  const parameterOrder = parseSortNumber(parameterCandidate);
  if (parameterOrder !== null) return parameterOrder;

  return fallbackOrder;
}

export function sortRacersByPaymentAndOrder(racers) {
  if (!Array.isArray(racers) || racers.length === 0) return [];

  const withMeta = racers.map((racer, sourceIndex) => {
    const fallbackOrder = sourceIndex + 1;
    const paymentDateIso = toSortableIsoDate(racer?.paymentDate);
    return {
      racer,
      sourceIndex,
      hasPayment: Boolean(paymentDateIso),
      paymentDateIso,
      orderNumber: resolveRacerOrder(racer, fallbackOrder),
    };
  });

  withMeta.sort((left, right) => {
    if (left.hasPayment !== right.hasPayment) {
      return left.hasPayment ? -1 : 1;
    }

    if (left.hasPayment && left.paymentDateIso !== right.paymentDateIso) {
      return left.paymentDateIso.localeCompare(right.paymentDateIso);
    }

    if (left.orderNumber !== right.orderNumber) {
      return left.orderNumber - right.orderNumber;
    }

    return left.sourceIndex - right.sourceIndex;
  });

  return withMeta.map((item) => item.racer);
}

