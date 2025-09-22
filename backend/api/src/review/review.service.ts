import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';

import { ReviewDto } from 'src/dtos/Review.dto';
import { NotFoundException } from '@nestjs/common';

@Injectable()
export class ReviewService {
    constructor(private readonly database: DatabaseService) {}

    async createReview(reviewData: ReviewDto) {
        return this.database.query(
            'INSERT INTO reviews (rating, comment, user_id, bike_rack_id) VALUES ($1, $2, $3, $4) RETURNING *',
            [
                reviewData.rating,
                reviewData.comment,
                reviewData.user_id,
                reviewData.bike_rack_id,
            ],
        )
    }

    async getReviewsByBikeRack(bikeRackId: number) {
        return this.database.query(
            'SELECT * FROM reviews WHERE bike_rack_id = $1',
            [bikeRackId],
        )
    }

    async deleteReview(reviewId: number) {
        return this.database.query('DELETE FROM reviews WHERE id = $1', [
            reviewId,
        ])
    }

    async getAllReviews() {
        return this.database.query('SELECT * FROM reviews', [])
    }

    async getAverageRating(bikeRackId: number) {
        const result = await this.database.query(
            'SELECT AVG(rating) as average_rating FROM reviews WHERE bike_rack_id = $1',
            [bikeRackId],
        )
        return result[0]?.average_rating || 0
    }

    async getReviewById(reviewId: number) {
        const result = await this.database.query(
            'SELECT * FROM reviews WHERE id = $1',
            [reviewId],
        )
        return result[0] || null
    }

    async updateReview(reviewId: number, reviewData: Partial<ReviewDto>) {
        const existingReview = await this.getReviewById(reviewId)
        if (!existingReview) {
            throw new NotFoundException('Review not found')
        }
        const updatedReview = { ...existingReview, ...reviewData }
        await this.database.query(
            'UPDATE reviews SET rating = $1, comment = $2 WHERE id = $3',
            [updatedReview.rating, updatedReview.comment, reviewId],
        )
        return this.getReviewById(reviewId)
    }

    async clearReviews(bike_rack_id: number) {
        return this.database.query(
            'DELETE FROM reviews WHERE bike_rack_id = $1',
            [bike_rack_id],
        )
    }


}
