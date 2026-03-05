-- List all items (for page load)
select
  id,
  category_id,
  name,
  description,
  is_reserved,
  reserved_by,
  reserved_at
from gift_items
order by category_id, name;

-- Try to reserve one item (returns true if success)
select reserve_gift_item('coz-porta-talheres', 'Nome da pessoa', 'device-token-unico', 'pin-hash-sha256');

-- Try to release one item (same actor and same device token)
select release_gift_item('coz-porta-talheres', 'Nome da pessoa', 'device-token-unico', 'pin-hash-sha256');

-- Reservation history (optional admin view)
select
  event_id,
  item_id,
  action,
  actor_name,
  created_at
from reservation_events
order by created_at desc
limit 100;
