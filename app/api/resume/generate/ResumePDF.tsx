import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";

import type { Profile } from "@/types";

export type GeneratedResumeContent = {
  summary: string;
  experience: Array<{
    companyName: string;
    jobTitle: string;
    startDate: string;
    endDate: string;
    responsibilities: string[];
  }>;
};

type ResumePDFProps = {
  profile: Profile;
  content: GeneratedResumeContent;
};

const styles = StyleSheet.create({
  page: { padding: 42, fontFamily: "Helvetica", color: "#1f2937", fontSize: 10, lineHeight: 1.45 },
  header: { borderBottom: "2pt solid #7c5cfc", paddingBottom: 16, marginBottom: 18 },
  name: { fontSize: 25, lineHeight: 1.1, fontFamily: "Helvetica-Bold", color: "#101828" },
  contact: { marginTop: 9, color: "#667085", fontSize: 9, lineHeight: 1.35 },
  section: { marginTop: 14 },
  sectionTitle: { fontSize: 11, fontFamily: "Helvetica-Bold", color: "#7c5cfc", textTransform: "uppercase", letterSpacing: 1, marginBottom: 7 },
  summary: { color: "#364153" },
  skills: { color: "#364153" },
  role: { marginBottom: 12 },
  roleHeader: { flexDirection: "row", justifyContent: "space-between", gap: 12 },
  company: { fontFamily: "Helvetica-Bold", color: "#101828", fontSize: 11 },
  dates: { color: "#667085", fontSize: 9 },
  title: { marginTop: 2, fontFamily: "Helvetica-Bold", color: "#364153" },
  bullet: { flexDirection: "row", marginTop: 3, paddingLeft: 8 },
  bulletMark: { width: 10, color: "#7c5cfc" },
  bulletText: { flex: 1, color: "#364153" },
  education: { color: "#364153" },
});

function formatDate(value: string): string {
  if (!value) return "";
  const [year, month] = value.split("-");
  if (!year || !month) return value;
  return new Date(Number(year), Number(month) - 1).toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

export function ResumePDF({ profile, content }: ResumePDFProps): React.ReactElement {
  const contact = [profile.email, profile.phone, profile.location, profile.linkedin_url, profile.portfolio_url]
    .filter(Boolean)
    .join("  |  ");

  return (
    <Document title={`${profile.full_name ?? "Resume"} Resume`} author="Job Hunt">
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.name}>{profile.full_name ?? "Professional Resume"}</Text>
          {contact ? <Text style={styles.contact}>{contact}</Text> : null}
        </View>

        {content.summary ? <View style={styles.section}>
          <Text style={styles.sectionTitle}>Professional Summary</Text>
          <Text style={styles.summary}>{content.summary}</Text>
        </View> : null}

        {profile.skills.length > 0 ? <View style={styles.section}>
          <Text style={styles.sectionTitle}>Skills</Text>
          <Text style={styles.skills}>{profile.skills.join("  •  ")}</Text>
        </View> : null}

        {content.experience.length > 0 ? <View style={styles.section}>
          <Text style={styles.sectionTitle}>Professional Experience</Text>
          {content.experience.map((role, index) => <View key={`${role.companyName}-${index}`} style={styles.role} wrap={false}>
            <View style={styles.roleHeader}>
              <Text style={styles.company}>{role.companyName}</Text>
              <Text style={styles.dates}>{formatDate(role.startDate)} - {role.endDate === "Present" ? "Present" : formatDate(role.endDate)}</Text>
            </View>
            <Text style={styles.title}>{role.jobTitle}</Text>
            {role.responsibilities.map((responsibility, responsibilityIndex) => <View key={`${responsibility}-${responsibilityIndex}`} style={styles.bullet}>
              <Text style={styles.bulletMark}>•</Text>
              <Text style={styles.bulletText}>{responsibility}</Text>
            </View>)}
          </View>)}
        </View> : null}

        {profile.education.institution || profile.education.degree ? <View style={styles.section}>
          <Text style={styles.sectionTitle}>Education</Text>
          <Text style={styles.education}>{[profile.education.degree, profile.education.field, profile.education.institution, profile.education.graduationYear].filter(Boolean).join(" | ")}</Text>
        </View> : null}
      </Page>
    </Document>
  );
}
