import { requireOwner } from "@/lib/auth/guards";
import { ownerReviews } from "@/repositories/lists";
import { Card, EmptyState, PageHeader } from "@/components/ui";
import { formatWhen } from "@/lib/utils";

export const instant = false;

export default async function ReviewsPage() {
  const owner = await requireOwner();
  const reviews = await ownerReviews(owner.business.id);
  return (
    <div>
      <PageHeader title="Review activity" body="These are drafts customers generated. They are not reviews posted on Google." />
      {reviews.length === 0 ? <EmptyState title="No drafts yet" body="When someone uses a QR code and writes a draft, it shows up here." /> : null}
      <div className="grid gap-3">
        {reviews.map((review) => (
          <Card key={review.id}>
            <div className="flex flex-wrap justify-between gap-2 text-sm text-stone-500">
              <span>
                {review.place.name} · {review.selectedRating} stars · {review.language}
              </span>
              <span>{formatWhen(review.createdAt)}</span>
            </div>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-6">{review.generatedContent}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
