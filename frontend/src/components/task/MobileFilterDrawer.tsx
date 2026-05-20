export default function TaskFilterDrawer({ open, onClose }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40">
      <div className="absolute bottom-0 w-full bg-base-100 rounded-t-xl p-4">
        <h3 className="font-semibold mb-3">Filters</h3>

        {/* search, status, priority */}

        <button className="btn btn-primary w-full mt-4">
          Apply Filters
        </button>
      </div>
    </div>
  );
}
