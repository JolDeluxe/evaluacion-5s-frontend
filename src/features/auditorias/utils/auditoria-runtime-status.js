const uploadIds = new Set();
const listeners = new Set();

const notifyListeners = () => {
  listeners.forEach((listener) => listener(getAuditRuntimeStatus()));
};

export function getAuditRuntimeStatus() {
  return {
    uploadsInProgress: uploadIds.size,
    isBusy: uploadIds.size > 0,
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
