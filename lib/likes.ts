export async function likePost(postId: string, userId: string) {
  const response = await fetch("/api/likes", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ postId, userId }),
  });
  return response.json();
}

export async function unlikePost(postId: string, userId: string) {
  const response = await fetch("/api/likes", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ postId, userId }),
  });
  return response.json();
}

export async function hasUserLikedPost(postId: string, userId: string) {
  const response = await fetch(`/api/likes?postId=${postId}&userId=${userId}`);
  const data = await response.json();
  return data.hasLiked;
}
