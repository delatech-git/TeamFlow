export type CreateIdeaBody = {
  title: string;
  shortDescription: string;
  coverImageFile?: File | null;
  tagIds: string[];
};

export type IdeaResponseDto = {
  id: string;
  title: string;
  shortDescription: string;
  coverImageUrl?: string | null;
  status: string;
  createdAt: string;
  updatedAt?: string;

  createdBy: {
    id: string;
    username: string;
    fullName?: string | null;
  };

  tags: {
    id: string;
    name: string;
    color?: string | null;
  }[];

  plannedGuide?: {
    id: string;
    summary: string;
    decisionsJson?: unknown | null;
    ideaId: string;
    createdById: string;
    createdAt: string;
    updatedAt: string;
  } | null;

  board?: {
    id: string;
    stickers: {
      id: string;
      type: string;
      content: string;
      x: number;
      y: number;
      width?: number | null;
      height?: number | null;
      color?: string | null;
      isPinned: boolean;
    }[];
  } | null;

  comments?: IdeaCommentDto[];

  teamPhotos?: TeamPhotoDto[];
};

export type TeamPhotoDto = {
  id: string;
  imageUrl: string;
  caption?: string | null;
  createdAt: string;
  uploadedBy: {
    id: string;
    username: string;
    fullName?: string | null;
    avatarUrl?: string | null;
  };
};

export type SaveIdeaBoardBody = {
  notes: unknown[];
  funItems: unknown[];
  pinnedNoteIds: string[];
  summaryPreview: string;
  postedDecisionId: string | null;
};

export type CreateIdeaCommentBody = {
  content: string;
  parentId?: string;
};

export type IdeaCommentDto = {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  parentId: string | null;
  author: {
    id: string;
    username: string;
    fullName?: string | null;
    avatarUrl?: string | null;
  };
};
