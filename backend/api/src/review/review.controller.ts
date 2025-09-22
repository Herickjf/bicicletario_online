import { Body, Controller, Post, Get, Delete, Param } from '@nestjs/common';
import { ReviewService } from './review.service';
import { ReviewDto } from 'src/dtos/Review.dto';

@Controller('review')
export class ReviewController {
    constructor(private readonly service: ReviewService) {}

    @Post('create')
    async create(@Body() review: ReviewDto) {
        return this.service.createReview(review);
    }

    @Get('bike-rack/:id')
    async getByBikeRack(@Param('id') bikeRackId: number) {
        return this.service.getReviewsByBikeRack(bikeRackId);
    }

    @Delete('delete/:id')
    async delete(@Param('id') reviewId: number) {
        return this.service.deleteReview(reviewId);
    }

    @Get('all')
    async getAll() {
        return this.service.getAllReviews();
    }

    @Get('average-rating/:bikeRackId')
    async getAverageRating(@Param('bikeRackId') bikeRackId: number) {
        return this.service.getAverageRating(bikeRackId);
    }

    @Get('get/:id')
    async get(@Param('id') userId: number) {
        return this.service.getReviewById(userId);
    }

    @Post('update/:id')
    async update(@Param('id') reviewId: number, @Body() reviewData: Partial<ReviewDto>) {
        return this.service.updateReview(reviewId, reviewData);
    }

    @Delete('clearReviews/:bike_rack_id')
    async clearReviews(@Param('bike_rack_id') bike_rack_id: number) {
        return this.service.clearReviews(bike_rack_id);
    }
}
