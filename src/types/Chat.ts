export type ChatMessage = {
    target_id: string;
    sender_id: string;
    message: string | null;
    audio: string | null;
}