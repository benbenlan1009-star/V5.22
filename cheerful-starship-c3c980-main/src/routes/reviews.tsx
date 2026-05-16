import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowLeft, Star, Trash2 } from 'lucide-react'
import { FormEvent, useEffect, useState } from 'react'

type Review = {
  id: number
  author: string
  rating: number
  body: string
  createdAt: string
}

export const Route = createFileRoute('/reviews')({
  component: ReviewsPage,
})

function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [admin, setAdmin] = useState(false)
  const [form, setForm] = useState({ author: '', rating: '5', body: '' })
  const [message, setMessage] = useState('')

  async function loadReviews() {
    const response = await fetch('/api/reviews')
    const data = await response.json()
    setReviews(data.reviews ?? [])
    setAdmin(Boolean(data.admin))
  }

  useEffect(() => {
    loadReviews()
  }, [])

  async function submitReview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage('')
    const response = await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, rating: Number(form.rating) }),
    })
    const data = await response.json().catch(() => ({}))
    if (!response.ok) {
      setMessage(data.message ?? 'The review could not be saved.')
      return
    }
    setForm({ author: '', rating: '5', body: '' })
    setMessage('Review saved.')
    await loadReviews()
  }

  async function removeReview(id: number) {
    const response = await fetch(`/api/reviews?id=${id}`, { method: 'DELETE' })
    if (!response.ok) {
      setMessage('Only admins can remove reviews.')
      return
    }
    setMessage('Review removed.')
    await loadReviews()
  }

  return (
    <main className="min-h-screen bg-[#f4f0e8] px-5 py-6 text-[#201b16] lg:px-8">
      <div className="mx-auto max-w-6xl">
        <Link
          to="/"
          className="mb-8 inline-flex items-center gap-2 rounded-full border border-[#c6b9a3] px-4 py-2 text-sm font-semibold transition hover:bg-[#201b16] hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Links
        </Link>

        <section className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="rounded-[2rem] bg-[#7f3f2f] p-6 text-[#fffaf0] md:p-8">
            <p className="mb-4 text-sm uppercase tracking-[0.24em] text-[#e9d184]">
              Review board
            </p>
            <h1 className="font-serif text-5xl leading-none">Leave a note for the site.</h1>
            <form className="mt-8 grid gap-3" onSubmit={submitReview}>
              <input
                className="input border-white/20 bg-white/95"
                placeholder="Your name"
                value={form.author}
                onChange={(event) => setForm({ ...form, author: event.target.value })}
              />
              <select
                className="input border-white/20 bg-white/95"
                value={form.rating}
                onChange={(event) => setForm({ ...form, rating: event.target.value })}
              >
                <option value="5">5 stars</option>
                <option value="4">4 stars</option>
                <option value="3">3 stars</option>
                <option value="2">2 stars</option>
                <option value="1">1 star</option>
              </select>
              <textarea
                className="input min-h-32 resize-y border-white/20 bg-white/95"
                placeholder="What should other visitors know?"
                value={form.body}
                onChange={(event) => setForm({ ...form, body: event.target.value })}
              />
              <button className="rounded-xl bg-[#1f2a24] px-4 py-3 font-semibold text-[#f8f1df]">
                Submit review
              </button>
            </form>
            {message && <p className="mt-4 rounded-xl bg-[#fffaf0] px-4 py-3 text-[#7f3f2f]">{message}</p>}
          </div>

          <div className="grid content-start gap-4">
            {reviews.length === 0 ? (
              <div className="rounded-3xl border border-[#ded1bd] bg-[#fffaf0] p-8">
                <h2 className="font-serif text-3xl">No reviews yet</h2>
                <p className="mt-3 text-[#6d6255]">The first review will appear here.</p>
              </div>
            ) : (
              reviews.map((review) => (
                <article key={review.id} className="rounded-3xl border border-[#ded1bd] bg-[#fffaf0] p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="mb-3 flex gap-1 text-[#b75b38]">
                        {Array.from({ length: review.rating }).map((_, index) => (
                          <Star key={index} className="h-4 w-4 fill-current" />
                        ))}
                      </div>
                      <h2 className="font-serif text-2xl">{review.author}</h2>
                    </div>
                    {admin && (
                      <button
                        aria-label={`Remove review from ${review.author}`}
                        className="rounded-full border border-[#c6b9a3] p-2 text-[#8b3f27] transition hover:bg-[#8b3f27] hover:text-white"
                        onClick={() => removeReview(review.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  <p className="mt-4 leading-7 text-[#5f5549]">{review.body}</p>
                </article>
              ))
            )}
          </div>
        </section>
      </div>
    </main>
  )
}

