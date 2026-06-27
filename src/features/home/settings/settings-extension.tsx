import { BookOpen, GitBranch, Github, ListTodo, MessageSquare, Notebook, Slack } from "lucide-react";
import React, { useEffect, useState } from "react";
import type { IntegrationPrefs } from "@/lib/api/mappers";
import { useSaveIntegrations, useSettingsQuery } from "@/lib/api/settings";
import { useAuth } from "@/lib/auth";
import { SettingRow, Toggle } from "@/features/home/settings/settings-ui";
import { C, Card } from "@/features/home/shared/ui-kit";

function IntegrationRow({
  icon,
  iconBg,
  iconColor,
  title,
  desc,
  on,
  onChange,
}: {
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  title: string;
  desc: string;
  on: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div
      className="flex items-center justify-between py-3 border-b last:border-b-0"
      style={{ borderColor: C.border }}
    >
      <div className="flex items-center gap-3 pr-6 min-w-0">
        <div
          className="w-9 h-9 rounded flex items-center justify-center shrink-0"
          style={{ background: iconBg, color: iconColor }}
        >
          {icon}
        </div>
        <div className="min-w-0">
          <div className="text-sm font-semibold" style={{ color: C.navy }}>
            {title}
          </div>
          <div className="text-xs mt-0.5" style={{ color: C.subtle }}>
            {desc}
          </div>
        </div>
      </div>
      <Toggle on={on} onChange={() => onChange(!on)} />
    </div>
  );
}

export function ExtensionSettings() {
  const { userId } = useAuth();
  const settingsUserId = userId ?? "";
  const { data: settings } = useSettingsQuery(settingsUserId);
  const saveIntegrationsMutation = useSaveIntegrations(settingsUserId);
  const [auto, setAuto] = useState(true);
  const [jira, setJira] = useState(true);
  const [github, setGithub] = useState(true);
  const [bitbucket, setBitbucket] = useState(false);
  const [slack, setSlack] = useState(false);
  const [teams, setTeams] = useState(false);
  const [confluence, setConfluence] = useState(false);
  const [notion, setNotion] = useState(false);

  useEffect(() => {
    if (!settings) return;
    setAuto(settings.integrations.autoCaptureEvents);
    setJira(settings.integrations.jira);
    setGithub(settings.integrations.github);
    setBitbucket(settings.integrations.bitbucket);
    setSlack(settings.integrations.slack);
    setTeams(settings.integrations.teams);
    setConfluence(settings.integrations.confluence);
    setNotion(settings.integrations.notion);
  }, [settings]);

  function persist(next: Partial<IntegrationPrefs>) {
    if (!settings) return;
    const integrations = { ...settings.integrations, ...next };
    saveIntegrationsMutation.mutate(integrations);
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div>
          <h3 className="text-base font-bold tracking-tight" style={{ color: C.navy }}>
            Extension Preferences
          </h3>
          <p className="text-xs mt-1" style={{ color: C.subtle }}>
            Capture sources and trigger windows
          </p>
        </div>
        <div className="mt-3">
          <SettingRow
            title="Auto-capture events"
            desc="Surface a capture prompt when work is completed."
            right={
              <Toggle
                on={auto}
                onChange={(value) => {
                  setAuto(value);
                  persist({ autoCaptureEvents: value });
                }}
              />
            }
          />
        </div>
      </Card>

      <Card className="p-6">
        <div>
          <h3 className="text-base font-bold tracking-tight" style={{ color: C.navy }}>
            Development & Issue Tracking
          </h3>
          <p className="text-xs mt-1" style={{ color: C.subtle }}>
            Capture merged PRs, code reviews, and ticket transitions.
          </p>
        </div>
        <div className="mt-3">
          <IntegrationRow
            icon={<ListTodo size={16} />}
            iconBg="#DEEBFF"
            iconColor="#0052CC"
            title="Jira"
            desc="Trigger when a ticket moves to Done."
            on={jira}
            onChange={(value) => {
              setJira(value);
              persist({ jira: value });
            }}
          />
          <IntegrationRow
            icon={<Github size={16} />}
            iconBg="#F4F5F7"
            iconColor="#172B4D"
            title="GitHub"
            desc="Trigger when a PR is merged with you as author or reviewer."
            on={github}
            onChange={(value) => {
              setGithub(value);
              persist({ github: value });
            }}
          />
          <IntegrationRow
            icon={<GitBranch size={16} />}
            iconBg="#DEEBFF"
            iconColor="#0052CC"
            title="Bitbucket"
            desc="Capture merged pull requests and code reviews."
            on={bitbucket}
            onChange={(value) => {
              setBitbucket(value);
              persist({ bitbucket: value });
            }}
          />
        </div>
      </Card>

      <Card className="p-6">
        <div>
          <h3 className="text-base font-bold tracking-tight" style={{ color: C.navy }}>
            Communication
          </h3>
          <p className="text-xs mt-1" style={{ color: C.subtle }}>
            Capture saved conversations, recaps, and channel highlights.
          </p>
        </div>
        <div className="mt-3">
          <IntegrationRow
            icon={<Slack size={16} />}
            iconBg="#F4ECFB"
            iconColor="#5243AA"
            title="Slack"
            desc="Capture saved messages and channel threads tagged with #wins."
            on={slack}
            onChange={(value) => {
              setSlack(value);
              persist({ slack: value });
            }}
          />
          <IntegrationRow
            icon={<MessageSquare size={16} />}
            iconBg="#E6F0FF"
            iconColor="#4B53BC"
            title="Microsoft Teams"
            desc="Capture meeting recaps and team channel mentions."
            on={teams}
            onChange={(value) => {
              setTeams(value);
              persist({ teams: value });
            }}
          />
        </div>
      </Card>

      <Card className="p-6">
        <div>
          <h3 className="text-base font-bold tracking-tight" style={{ color: C.navy }}>
            Documentation
          </h3>
          <p className="text-xs mt-1" style={{ color: C.subtle }}>
            Capture docs, pages, and knowledge base contributions.
          </p>
        </div>
        <div className="mt-3">
          <IntegrationRow
            icon={<BookOpen size={16} />}
            iconBg="#DEEBFF"
            iconColor="#0052CC"
            title="Confluence"
            desc="Capture pages you author, edit, or get tagged in."
            on={confluence}
            onChange={(value) => {
              setConfluence(value);
              persist({ confluence: value });
            }}
          />
          <IntegrationRow
            icon={<Notebook size={16} />}
            iconBg="#F4F5F7"
            iconColor="#172B4D"
            title="Notion"
            desc="Capture databases and docs you contribute to."
            on={notion}
            onChange={(value) => {
              setNotion(value);
              persist({ notion: value });
            }}
          />
        </div>
      </Card>
    </div>
  );
}
