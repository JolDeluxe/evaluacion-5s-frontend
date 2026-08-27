const uploadIds = new Set();
const listeners = new Set();
let lastDraftSavedAt = 0;
let draftRevision = 0;
let savedDraftRevision = 0;

const notifyListeners = () => {
  listeners.forEach((listener) => listener(getAuditRuntimeStatus()));
};

export function getAuditRuntimeStatus() {
  const hasPendingDraft = savedDraftRevision !== draftRevision;

  return {
    draftRevision,
    savedDraftRevision,
    hasPendingDraft,
    uploadsInProgress: uploadIds.size,
    isBusy: uploadIds.size > 0 || hasPendingDraft,
    lastDraftSavedAt,
  };
}

export function setAuditUploadActive(id, active) {
  if (!id) return;

  if (active) {
    uploadIds.add(id);
  } else {
    uploadIds.delete(id);
  }

  notifyListeners();
}

export function markAuditDraftDirty() {
  draftRevision += 1;
  notifyListeners();
  return draftRevision;
}

export function markAuditDraftSaved(revision = draftRevision, value = Date.now()) {
  if (revision === draftRevision) {
    savedDraftRevision = draftRevision;
  } else if (revision > savedDraftRevision) {
    savedDraftRevision = revision;
  }

  lastDraftSavedAt = typeof value === 'number' ? value : Date.now();
  notifyListeners();
}

export function subscribeAuditRuntimeStatus(listener) {
  listeners.add(listener);
  listener(getAuditRuntimeStatus());

  return () => {
    listeners.delete(listener);
  };
}

export function waitForAuditIdle({ timeoutMs = 10000 } = {}) {
  if (!getAuditRuntimeStatus().isBusy) {
    return Promise.resolve(true);
  }

  return new Promise((resolve) => {
    let done = false;
    let unsubscribe = () => {};

    const finish = (result) => {
      if (done) return;
      done = true;
      window.clearTimeout(timeoutId);
      unsubscribe();
      resolve(result);
    };

    const timeoutId = window.setTimeout(() => {
      finish(false);
    }, timeoutMs);

    unsubscribe = subscribeAuditRuntimeStatus((status) => {
      if (!status.isBusy) {
        window.setTimeout(() => finish(true), 0);
      }
    });
  });
}

export async function waitForAuditSafeToReload({
  autosaveSettleMs = 1000,
  uploadTimeoutMs = 15000,
} = {}) {
  return new Promise((resolve) => {
    let done = false;
    let settleTimeoutId = null;
    let unsubscribe = () => {};

    const isSafeNow = () => {
      const status = getAuditRuntimeStatus();
      return !status.hasPendingDraft && status.uploadsInProgress === 0;
    };

    const clearSettleTimer = () => {
      if (settleTimeoutId) {
        window.clearTimeout(settleTimeoutId);
        settleTimeoutId = null;
      }
    };

    const finish = (result) => {
      if (done) return;
      done = true;
      clearSettleTimer();
      window.clearTimeout(timeoutId);
      unsubscribe();
      resolve(result);
    };

    const scheduleSettleCheck = () => {
      clearSettleTimer();

      if (!isSafeNow()) {
        return;
      }

      settleTimeoutId = window.setTimeout(() => {
        finish(isSafeNow());
      }, autosaveSettleMs);
    };

    const timeoutId = window.setTimeout(() => {
      finish(false);
    }, uploadTimeoutMs);

    unsubscribe = subscribeAuditRuntimeStatus(scheduleSettleCheck);
    scheduleSettleCheck();
  });
}
