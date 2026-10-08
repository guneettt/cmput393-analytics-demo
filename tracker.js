(function () {
  'use strict';
  var script = document.currentScript;
  var endpoint = script && script.dataset.endpoint;
  var siteId = script && script.dataset.siteId;
  if (!endpoint || !siteId) return;

  var visitorKey = 'analytics_visitor_' + siteId;
  var sessionKey = 'analytics_session_' + siteId;
  var visitorId = localStorage.getItem(visitorKey);
  if (!visitorId) {
    visitorId = crypto.randomUUID();
    localStorage.setItem(visitorKey, visitorId);
  }

  var now = Date.now();
  var session;
  try { session = JSON.parse(localStorage.getItem(sessionKey)); } catch (_) {}
  if (!session || !session.id || !session.last || now - session.last > 30 * 60 * 1000) {
    session = {id: crypto.randomUUID(), last: now};
  } else {
    session.last = now;
  }
  localStorage.setItem(sessionKey, JSON.stringify(session));

  fetch(endpoint.replace(/\/$/, '') + '/api/v2/events', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify([{
      event_id: crypto.randomUUID(),
      site_id: siteId,
      visitor_id: visitorId,
      ts: new Date().toISOString().replace(/\.\d{3}Z$/, 'Z'),
      path: location.pathname,
      referrer: document.referrer || null,
      session_id: session.id
    }]),
    keepalive: true
  }).catch(function () {});
}());
