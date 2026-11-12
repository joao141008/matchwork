<?php

namespace Source\Models\Faqs;

use Source\Core\Model;

class Faq extends Model
{
    private ?int $id;
    private ?int $faqs_category_id;
    private ?string $question;
    private ?string $answer;

    public function __construct(?int $id = null, ?int $faqs_category_id = null, ?string $question = null, ?string $answer = null)
    {
        $this->id = $id;
        $this->faqs_category_id = $faqs_category_id;
        $this->question = $question;
        $this->answer = $answer;
        $this->table = 'faqs';
        $this->fillable = ['faqsCategoryId', 'question', 'answer'];
    }

    public function getId(): ?int { return $this->id; }
    public function setId(?int $id): void { $this->id = $id; }
    public function getFaqsCategoryId(): ?int { return $this->faqs_category_id; }
    public function setFaqsCategoryId(?int $faqs_category_id): void { $this->faqs_category_id = $faqs_category_id; }
    public function getQuestion(): ?string { return $this->question; }
    public function setQuestion(?string $question): void { $this->question = $question; }
    public function getAnswer(): ?string { return $this->answer; }
    public function setAnswer(?string $answer): void { $this->answer = $answer; }
}
