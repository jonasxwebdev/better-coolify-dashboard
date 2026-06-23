import ResourceDetails from "../../resource/ResourceDetails";
import DatabaseInfo from "../../resource/DatabaseInfo";
import ComponentsList from "../../resource/ComponentsList";
import DeploymentStats from "../../resource/DeploymentStats";
import { RESOURCE_TYPES } from "../../../constants/resourceTypes";
import useResourceStore from "../../../store/resourceStore";
import { deployingIndex } from "../../../services/serverGrouping";

const ResourceCardBody = ({ resource }) => {
  const deployments = useResourceStore((s) => s.deployments);
  const isDeploying = deployingIndex(deployments).has(resource.uuid);

  return (
    <div className="bg-muted/30 border-t border-border px-3 md:px-8 py-4 md:py-6">
      {/* Common resource details */}
      <ResourceDetails resource={resource} />

      {/* Deployment / runtime stats */}
      <div className="mt-4">
        <DeploymentStats resource={resource} isDeploying={isDeploying} />
      </div>

      {/* Database-specific information */}
      {resource.type === RESOURCE_TYPES.DATABASE && (
        <div className="mt-4">
          <DatabaseInfo resource={resource} />
        </div>
      )}

      {/* Components list (for services with sub-resources) */}
      <div className="mt-4">
        <ComponentsList
          applications={resource.applications}
          databases={resource.databases}
        />
      </div>
    </div>
  );
};

export default ResourceCardBody;
