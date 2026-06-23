import ResourceCard from "../../../components/ResourceCard";

const TypeSection = ({ label, resources }) => {
  if (!resources || resources.length === 0) return null;
  return (
    <div className="mb-4">
      <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-1 mb-2">
        {label} ({resources.length})
      </div>
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        {resources.map((resource, index) => (
          <ResourceCard
            key={resource.uuid || resource.id || index}
            resource={resource}
          />
        ))}
      </div>
    </div>
  );
};

export default TypeSection;
