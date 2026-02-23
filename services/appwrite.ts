import { Account, Client, Databases, ID, Query } from 'appwrite';

const endpoint = import.meta.env.VITE_APPWRITE_ENDPOINT;
const projectId = import.meta.env.VITE_APPWRITE_PROJECT_ID;
const databaseId = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const profilesCollectionId = import.meta.env.VITE_APPWRITE_PROFILES_COLLECTION_ID;
const activityLogsCollectionId = import.meta.env.VITE_APPWRITE_ACTIVITY_LOGS_COLLECTION_ID;

export const hasAppwriteEnv = Boolean(
  endpoint &&
  projectId &&
  databaseId &&
  profilesCollectionId &&
  activityLogsCollectionId
);

if (!hasAppwriteEnv) {
  console.error(
    'Missing Appwrite environment variables: VITE_APPWRITE_ENDPOINT, VITE_APPWRITE_PROJECT_ID, VITE_APPWRITE_DATABASE_ID, VITE_APPWRITE_PROFILES_COLLECTION_ID, VITE_APPWRITE_ACTIVITY_LOGS_COLLECTION_ID'
  );
}

const client = new Client()
  .setEndpoint(endpoint ?? 'https://cloud.appwrite.io/v1')
  .setProject(projectId ?? 'missing-project-id');

const account = new Account(client);
const databases = new Databases(client);

export interface AuthUser {
  id: string;
  email: string | null;
}

export interface ProfileData {
  full_name?: string;
  role?: string;
  avatar_url?: string | null;
  updated_at?: string;
}

export interface ActivityLog {
  id: string;
  created_at: string;
  description: string;
  status: string;
}

export const getAuthErrorMessage = (error: any) => {
  const message = String(error?.message ?? '').toLowerCase();
  const type = String(error?.type ?? '').toLowerCase();

  if (type === 'user_already_exists' || message.includes('already exists')) {
    return 'Este e-mail já está cadastrado.';
  }

  if (
    type === 'user_invalid_credentials' ||
    message.includes('invalid credentials') ||
    message.includes('invalid email or password')
  ) {
    return 'E-mail ou senha inválidos.';
  }

  if (
    message.includes('password') &&
    (message.includes('8') || message.includes('short') || message.includes('length'))
  ) {
    return 'A senha deve ter pelo menos 8 caracteres.';
  }

  if (message.includes('email') && message.includes('invalid')) {
    return 'Digite um e-mail válido.';
  }

  if (message.includes('guests are not allowed') || message.includes('missing scope')) {
    return 'Cadastro bloqueado no Appwrite. Habilite o registro de usuários nas configurações de Auth.';
  }

  if (type === 'user_email_not_verified' || message.includes('not verified')) {
    return 'E-mail ainda não verificado. Verifique sua caixa de entrada para continuar.';
  }

  return error?.message || 'Ocorreu um erro inesperado.';
};

export const signUp = async (email: string, password: string) => {
  return account.create(ID.unique(), email, password);
};

export const signIn = async (email: string, password: string) => {
  await account.createEmailPasswordSession(email, password);
  return getCurrentUser();
};

export const signOut = async () => {
  await account.deleteSession('current');
};

export const updatePassword = async (newPassword: string) => {
  await account.updatePassword(newPassword);
};

export const getCurrentUser = async (): Promise<AuthUser | null> => {
  try {
    const user = await account.get();
    return { id: user.$id, email: user.email ?? null };
  } catch {
    return null;
  }
};

export const getProfile = async (userId: string): Promise<ProfileData | null> => {
  try {
    const document = await databases.getDocument(
      databaseId!,
      profilesCollectionId!,
      userId
    );

    return {
      full_name: document.full_name,
      role: document.role,
      avatar_url: document.avatar_url,
      updated_at: document.updated_at,
    };
  } catch {
    return null;
  }
};

export const upsertProfile = async (userId: string, data: ProfileData) => {
  const payload = {
    user_id: userId,
    ...data,
    updated_at: new Date().toISOString(),
  };

  try {
    await databases.updateDocument(databaseId!, profilesCollectionId!, userId, payload);
  } catch {
    await databases.createDocument(databaseId!, profilesCollectionId!, userId, {
      ...payload,
      created_at: new Date().toISOString(),
    });
  }
};

export const getActivityLogs = async (userId: string, limit = 10): Promise<ActivityLog[]> => {
  try {
    const response = await databases.listDocuments(databaseId!, activityLogsCollectionId!, [
      Query.equal('user_id', userId),
      Query.orderDesc('$createdAt'),
      Query.limit(limit),
    ]);

    return response.documents.map((document) => ({
      id: document.$id,
      created_at: document.created_at ?? document.$createdAt,
      description: document.description ?? '',
      status: document.status ?? 'OK',
    }));
  } catch {
    return [];
  }
};