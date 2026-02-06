// src/modules/auth/services/otp-cleanup.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { OtpRepository } from 'src/db';

@Injectable()
export class OtpCleanupService {
    private readonly logger = new Logger(OtpCleanupService.name);

    constructor(
        private readonly otpRepository: OtpRepository,
    ) { }


    @Cron('0 */6 * * *', {
        name: 'delete-expired-otps',
        timeZone: 'Africa/Cairo',
    })
    async deleteExpiredOtps() {
        this.logger.log('🧹 Starting scheduled cleanup of expired OTPs...');

        try {
            const now = new Date();



            const result = await this.otpRepository.deleteMany({
                filter: { expiresAt: { $lt: now } },
            });

            this.logger.log(
                `✅ Cleanup completed successfully. Deleted ${result.deletedCount} expired OTP(s).`,
            );


            return {
                success: true,
                deletedCount: result.deletedCount,
                timestamp: now,
            };
        } catch (error) {
            this.logger.error(
                `❌ Error during OTP cleanup: ${error.message}`,
                error.stack,
            );

            return {
                success: false,
                error: error.message,
                timestamp: new Date(),
            };
        }
    }

    async triggerManualCleanup() {
        this.logger.log('🔧 Manual cleanup triggered');
        return this.deleteExpiredOtps();
    }
}