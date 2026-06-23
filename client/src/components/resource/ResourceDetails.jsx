import { useTranslation } from "react-i18next";
import {
  InformationCircleIcon,
  CodeBracketIcon,
  CubeIcon,
  HeartIcon,
  ServerIcon,
  SignalIcon,
  ArrowUpOnSquareIcon,
  ShareIcon,
} from "@heroicons/react/24/outline";
import { getDockerImage } from "../../utils/resourceUtils";
import { getStatusColor } from "../../utils/statusUtils";

const ResourceDetails = ({ resource }) => {
  const { t } = useTranslation();
  const dockerImage = getDockerImage(resource);
  const statusColor = getStatusColor(resource.status);

  return (
    <div className="space-y-4 md:space-y-6">
      {resource.description && (
        <div className="bg-muted/40 rounded-lg p-3 md:p-4 border border-border">
          <div className="flex items-center gap-2 mb-2 md:mb-3">
            <InformationCircleIcon className="w-4 h-4 md:w-5 md:h-5 text-muted-foreground" />
            <span className="text-sm font-semibold text-foreground">
              {t("resourceCard.description")}
            </span>
          </div>
          <p className="text-xs md:text-sm text-muted-foreground font-mono leading-relaxed bg-secondary px-2 md:px-3 py-2 rounded break-words">
            {resource.description}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(resource.git_repository || resource.git_branch) && (
          <div className="bg-muted/40 rounded-lg p-4 border border-border">
            <div className="flex items-center gap-2 mb-3">
              <CodeBracketIcon className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm font-semibold text-foreground">
                Git Repository
              </span>
            </div>

            <div className="flex items-center justify-between gap-4 bg-secondary px-3 py-2 rounded">
              {resource.git_repository && (
                <p className="text-sm text-muted-foreground font-mono break-all">
                  {resource.git_repository}
                </p>
              )}

              {resource.git_branch && (
                <div className="inline-flex items-center gap-2 bg-secondary px-2.5 py-1 rounded-full text-xs flex-shrink-0">
                  <ShareIcon className="w-4 h-4 text-muted-foreground" />
                  <span className="text-foreground font-bold">
                    {resource.git_branch}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {dockerImage && (
          <div className="bg-muted/40 rounded-lg p-4 border border-border">
            <div className="flex items-center gap-2 mb-3">
              <CubeIcon className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm font-semibold text-foreground">
                Docker Image
              </span>
            </div>
            <p className="text-sm text-muted-foreground font-mono bg-secondary px-3 py-2 rounded">
              {dockerImage}
            </p>
          </div>
        )}

        {resource.status && (
          <div className="bg-muted/40 rounded-lg p-4 border border-border">
            <div className="flex items-center gap-2 mb-3">
              <HeartIcon className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm font-semibold text-foreground">
                {t("resourceCard.applicationStatus")}
              </span>
            </div>
            <p className="inline-flex items-center gap-2 text-sm text-muted-foreground font-mono bg-secondary px-3 py-2 rounded">
              <span className={`w-3 h-3 rounded-full ${statusColor}`}></span>
              <span className="font-medium capitalize">{resource.status}</span>
            </p>
          </div>
        )}

        {resource.destination?.server && (
          <div className="bg-muted/40 rounded-lg p-4 border border-border">
            <div className="flex items-center gap-2 mb-3">
              <ServerIcon className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm font-semibold text-foreground">Server</span>
            </div>
            <p className="text-sm text-muted-foreground font-mono bg-secondary px-3 py-2 rounded">
              {resource.destination.server.name}
            </p>
          </div>
        )}

        {resource.destination?.network && (
          <div className="bg-muted/40 rounded-lg p-4 border border-border">
            <div className="flex items-center gap-2 mb-3">
              <SignalIcon className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm font-semibold text-foreground">Network</span>
            </div>
            <p className="text-sm text-muted-foreground font-mono break-all bg-secondary px-3 py-2 rounded">
              {resource.destination.network}
            </p>
          </div>
        )}

        {(resource.public_port ||
          resource.internal_port ||
          resource.ports_exposes ||
          resource.ports_mappings) && (
          <div className="bg-muted/40 rounded-lg p-4 border border-border">
            <div className="flex items-center gap-2 mb-3">
              <ArrowUpOnSquareIcon className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm font-semibold text-foreground">Ports</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {resource.public_port && (
                <p className="text-sm text-muted-foreground font-mono bg-secondary px-3 py-2 rounded">
                  <span className="text-muted-foreground">Public:</span>{" "}
                  <span className="text-foreground">{resource.public_port}</span>
                </p>
              )}
              {resource.internal_port && (
                <p className="text-sm text-muted-foreground font-mono bg-secondary px-3 py-2 rounded">
                  <span className="text-muted-foreground">Private:</span>{" "}
                  <span className="text-foreground">
                    {resource.internal_port}
                  </span>
                </p>
              )}
              {resource.ports_exposes && (
                <p className="text-sm text-muted-foreground font-mono bg-secondary px-3 py-2 rounded">
                  <span className="text-muted-foreground">Exposed:</span>{" "}
                  <span className="text-muted-foreground">
                    {resource.ports_exposes}
                  </span>
                </p>
              )}
              {resource.ports_mappings && (
                <p className="text-sm text-muted-foreground font-mono bg-secondary px-3 py-2 rounded">
                  <span className="text-muted-foreground">Mapped:</span>{" "}
                  <span className="text-muted-foreground">
                    {resource.ports_mappings}
                  </span>
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResourceDetails;
