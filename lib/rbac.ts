import { promises as fs } from "fs";
import path from "path";

export interface PermissionMatrix {
  [role: string]: {
    [permission: string]: boolean;
  };
}

const DEFAULT_MATRIX: PermissionMatrix = {
  "OWNER": {
    manage_billing: true,
    manage_team: true,
    view_all_projects: true,
    edit_checklists: true,
    annotate_workpapers: true,
    dispatch_k1: true,
    execute_ai: true,
    access_developer_api: true,
  },
  "OWNER/ADMIN": {
    manage_billing: true,
    manage_team: true,
    view_all_projects: true,
    edit_checklists: true,
    annotate_workpapers: true,
    dispatch_k1: true,
    execute_ai: true,
    access_developer_api: true,
  },
  "MANAGER": {
    manage_billing: false,
    manage_team: true,
    view_all_projects: true,
    edit_checklists: true,
    annotate_workpapers: true,
    dispatch_k1: true,
    execute_ai: true,
    access_developer_api: false,
  },
  "PREPARER": {
    manage_billing: false,
    manage_team: false,
    view_all_projects: false,
    edit_checklists: true,
    annotate_workpapers: true,
    dispatch_k1: false,
    execute_ai: true,
    access_developer_api: false,
  },
  "REVIEWER": {
    manage_billing: false,
    manage_team: false,
    view_all_projects: true,
    edit_checklists: false,
    annotate_workpapers: true,
    dispatch_k1: true,
    execute_ai: true,
    access_developer_api: false,
  },
  "ADMIN_STAFF": {
    manage_billing: false,
    manage_team: false,
    view_all_projects: true,
    edit_checklists: true,
    annotate_workpapers: false,
    dispatch_k1: false,
    execute_ai: false,
    access_developer_api: false,
  },
  "AUDITOR": {
    manage_billing: false,
    manage_team: false,
    view_all_projects: true,
    edit_checklists: false,
    annotate_workpapers: false,
    dispatch_k1: false,
    execute_ai: false,
    access_developer_api: false,
  },
};

const matrixFilePath = path.join(process.cwd(), "prisma", "rbac_matrix.json");

export async function getPermissionMatrix(): Promise<PermissionMatrix> {
  try {
    const data = await fs.readFile(matrixFilePath, "utf-8");
    const parsed = JSON.parse(data);
    if (!parsed["OWNER"] && parsed["OWNER/ADMIN"]) {
      parsed["OWNER"] = { ...parsed["OWNER/ADMIN"] };
    }
    return parsed;
  } catch (err) {
    await savePermissionMatrix(DEFAULT_MATRIX);
    return DEFAULT_MATRIX;
  }
}

export async function savePermissionMatrix(matrix: PermissionMatrix): Promise<void> {
  await fs.mkdir(path.dirname(matrixFilePath), { recursive: true });
  await fs.writeFile(matrixFilePath, JSON.stringify(matrix, null, 2), "utf-8");
}
